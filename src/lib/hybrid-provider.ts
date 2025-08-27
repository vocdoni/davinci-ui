/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Eip1193Provider, JsonRpcProvider } from 'ethers'

/**
 * EIP-1193 adapter for JsonRpcProvider
 * Converts JsonRpcProvider to EIP-1193 compatible interface
 */
class JsonRpcProviderAdapter implements Eip1193Provider {
  private provider: JsonRpcProvider

  constructor(provider: JsonRpcProvider) {
    this.provider = provider
  }

  async request(args: { method: string; params?: any[] | Record<string, any> }): Promise<any> {
    const { method, params = [] } = args

    // Convert EIP-1193 request to JsonRpcProvider method calls
    switch (method) {
      case 'eth_chainId': {
        const network = await this.provider.getNetwork()
        return `0x${network.chainId.toString(16)}`
      }

      case 'eth_blockNumber': {
        const blockNumber = await this.provider.getBlockNumber()
        return `0x${blockNumber.toString(16)}`
      }

      case 'eth_getBalance':
        if (Array.isArray(params) && params.length >= 1) {
          const balance = await this.provider.getBalance(params[0], params[1] || 'latest')
          return `0x${balance.toString(16)}`
        }
        throw new Error('Invalid params for eth_getBalance')

      case 'eth_getCode':
        if (Array.isArray(params) && params.length >= 1) {
          return await this.provider.getCode(params[0], params[1] || 'latest')
        }
        throw new Error('Invalid params for eth_getCode')

      case 'eth_call':
        if (Array.isArray(params) && params.length >= 1) {
          return await this.provider.call(params[0], params[1] || 'latest')
        }
        throw new Error('Invalid params for eth_call')

      case 'eth_getBlockByNumber':
      case 'eth_getBlockByHash':
        if (Array.isArray(params) && params.length >= 1) {
          const block =
            method === 'eth_getBlockByNumber'
              ? await this.provider.getBlock(params[0], params[1] || false)
              : await this.provider.getBlock(params[0], params[1] || false)
          return block
        }
        throw new Error(`Invalid params for ${method}`)

      case 'eth_getTransactionByHash':
        if (Array.isArray(params) && params.length >= 1) {
          return await this.provider.getTransaction(params[0])
        }
        throw new Error('Invalid params for eth_getTransactionByHash')

      case 'eth_getTransactionReceipt':
        if (Array.isArray(params) && params.length >= 1) {
          return await this.provider.getTransactionReceipt(params[0])
        }
        throw new Error('Invalid params for eth_getTransactionReceipt')

      case 'eth_getLogs':
        if (Array.isArray(params) && params.length >= 1) {
          return await this.provider.getLogs(params[0])
        }
        throw new Error('Invalid params for eth_getLogs')

      case 'eth_gasPrice': {
        const feeData = await this.provider.getFeeData()
        return feeData.gasPrice ? `0x${feeData.gasPrice.toString(16)}` : null
      }

      case 'eth_maxPriorityFeePerGas': {
        const feeData2 = await this.provider.getFeeData()
        return feeData2.maxPriorityFeePerGas ? `0x${feeData2.maxPriorityFeePerGas.toString(16)}` : null
      }

      case 'net_version': {
        const network2 = await this.provider.getNetwork()
        return network2.chainId.toString()
      }

      default:
        // For unsupported methods, try the raw send method
        return await this.provider.send(method, Array.isArray(params) ? params : [])
    }
  }
}

/**
 * EIP-1193 compliant provider that routes read and write operations to different underlying providers
 *
 * This solves the Farcaster miniapp issue where:
 * - Read operations need reliable RPC endpoints
 * - Write operations need to go through the Farcaster wallet for proper UX
 */

// Methods that are GUARANTEED to be pure read operations (safe for public RPC)
// These MUST go through the read provider as Farcaster wallet doesn't support them
const PURE_READ_METHODS = [
  // Pure blockchain state queries
  'eth_getBalance',
  'eth_getCode',
  'eth_getBlockByNumber',
  'eth_getBlockByHash',
  'eth_getTransactionByHash',
  'eth_getTransactionReceipt',
  'eth_getLogs',
  'eth_getStorageAt', // Storage queries are reads

  // Contract calls - these are READ operations, not writes
  'eth_call', // Contract read calls - Farcaster doesn't support this!
  'eth_estimateGas', // Gas estimation - also a read operation

  // Network info
  'eth_chainId',
  'net_version',
  'eth_blockNumber',
  'eth_gasPrice',
  'eth_maxPriorityFeePerGas',
  'eth_feeHistory',
  'eth_getTransactionCount', // Getting nonce is a read operation

  // Debug and trace methods
  'debug_traceCall',
  'eth_createAccessList',
]

// Methods that might be part of transaction flows but are still reads
// We keep this category but make it empty for now since the key insight is:
// eth_call is a READ operation that Farcaster doesn't support!
const TRANSACTION_RELATED_METHODS: string[] = [
  // Empty - we were wrong to put read operations here
]

// Methods that should be routed to the write provider (wallet)
const WRITE_METHODS = [
  // Transaction operations
  'eth_sendTransaction',
  'eth_signTransaction',
  'eth_sendRawTransaction',

  // Account management
  'eth_requestAccounts',
  'eth_accounts',

  // Signing operations
  'personal_sign',
  'personal_ecRecover',
  'eth_sign',
  'eth_signTypedData',
  'eth_signTypedData_v1',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',

  // Wallet operations
  'wallet_requestPermissions',
  'wallet_getPermissions',
  'wallet_switchEthereumChain',
  'wallet_addEthereumChain',
  'wallet_watchAsset',

  // Connection
  'eth_coinbase',
]

export interface HybridProviderOptions {
  // Provider for read operations (can be JsonRpcProvider or Eip1193Provider)
  readProvider: JsonRpcProvider | Eip1193Provider

  // Provider for write operations (wallet provider like Farcaster)
  writeProvider: Eip1193Provider

  // Optional: custom method routing
  customReadMethods?: string[]
  customWriteMethods?: string[]
}

export class HybridProvider implements Eip1193Provider {
  private readProvider: Eip1193Provider
  private writeProvider: Eip1193Provider
  private pureReadMethods: Set<string>
  private transactionMethods: Set<string>
  private writeMethods: Set<string>

  constructor(options: HybridProviderOptions) {
    // Convert JsonRpcProvider to EIP-1193 compatible if needed
    this.readProvider =
      'request' in options.readProvider
        ? (options.readProvider as Eip1193Provider)
        : new JsonRpcProviderAdapter(options.readProvider as JsonRpcProvider)

    this.writeProvider = options.writeProvider

    // Build method sets with conservative routing
    this.pureReadMethods = new Set([...PURE_READ_METHODS, ...(options.customReadMethods || [])])

    this.transactionMethods = new Set([...TRANSACTION_RELATED_METHODS])

    this.writeMethods = new Set([...WRITE_METHODS, ...(options.customWriteMethods || [])])

    // Forward events from write provider (wallet events are more important)
    this.forwardEvents()
  }

  /**
   * Main EIP-1193 request method - routes calls based on method type with fallback handling
   */
  async request(args: { method: string; params?: any[] | Record<string, any> }): Promise<any> {
    const { method, params } = args

    console.log(`🔀 HybridProvider routing ${method}`, {
      params: Array.isArray(params) ? `[${params.length} items]` : params,
    })

    // Route pure read operations to read provider with smart fallback
    if (this.pureReadMethods.has(method)) {
      console.log(`📖 Routing ${method} to read provider (pure read)`)
      try {
        return await this.readProvider.request(args)
      } catch (error) {
        console.warn(`📖❌ Read provider failed for ${method}:`, error)

        // Only fallback to writeProvider for methods it actually supports
        // Farcaster wallet has very limited read support - mostly just identity/network info
        const farcasterSupportedReads = ['eth_chainId', 'eth_accounts', 'net_version']

        if (farcasterSupportedReads.includes(method)) {
          console.log(`🔄 Attempting fallback to write provider for ${method}`)
          try {
            return await this.writeProvider.request(args)
          } catch (fallbackError) {
            console.error(`❌ Write provider also failed for ${method}:`, fallbackError)
            throw error // Throw original error
          }
        } else {
          console.log(`⚠️ Method ${method} not supported by Farcaster wallet, throwing original error`)
          throw error
        }
      }
    }

    // Route known write operations to write provider
    if (this.writeMethods.has(method)) {
      console.log(`✍️ Routing ${method} to write provider (write operation)`)
      return this.writeProvider.request(args)
    }

    // Route transaction-related methods to write provider (safer for consistency)
    if (this.transactionMethods.has(method)) {
      console.log(`🔗 Routing ${method} to write provider (transaction-related)`)
      return this.writeProvider.request(args)
    }

    // Default to write provider for unknown methods (safest approach)
    console.log(`❓ Unknown method ${method}, defaulting to write provider (conservative)`)
    return this.writeProvider.request(args)
  }

  /**
   * Forward events from the write provider (wallet)
   * These are the events that matter for wallet state changes
   */
  private forwardEvents() {
    // Standard EIP-1193 events
    const events = ['connect', 'disconnect', 'accountsChanged', 'chainChanged', 'message']

    events.forEach((eventName) => {
      // Check if the provider has event listener capabilities
      const provider = this.writeProvider as any
      if (provider.on && typeof provider.on === 'function') {
        provider.on(eventName, (...args: any[]) => {
          console.log(`📡 HybridProvider forwarding event: ${eventName}`, args)
          this.emit(eventName, ...args)
        })
      }
    })
  }

  /**
   * Event emitter implementation for EIP-1193 compatibility
   */
  private listeners: Record<string, ((...args: any[]) => void)[]> = {}

  on(event: string, listener: (...args: any[]) => void): this {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(listener)
    return this
  }

  once(event: string, listener: (...args: any[]) => void): this {
    const onceWrapper = (...args: any[]) => {
      this.removeListener(event, onceWrapper)
      listener(...args)
    }
    return this.on(event, onceWrapper)
  }

  removeListener(event: string, listener: (...args: any[]) => void): this {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(listener)
      if (index > -1) {
        this.listeners[event].splice(index, 1)
      }
    }
    return this
  }

  removeAllListeners(event?: string): this {
    if (event) {
      delete this.listeners[event]
    } else {
      this.listeners = {}
    }
    return this
  }

  emit(event: string, ...args: any[]): boolean {
    if (this.listeners[event]) {
      this.listeners[event].forEach((listener) => {
        try {
          listener(...args)
        } catch (error) {
          console.error(`Error in HybridProvider event listener for ${event}:`, error)
        }
      })
      return true
    }
    return false
  }

  /**
   * Utility method to check if a method is classified as a pure read operation
   */
  isPureReadMethod(method: string): boolean {
    return this.pureReadMethods.has(method)
  }

  /**
   * Utility method to check if a method is classified as a write operation
   */
  isWriteMethod(method: string): boolean {
    return this.writeMethods.has(method)
  }

  /**
   * Utility method to check if a method is transaction-related
   */
  isTransactionMethod(method: string): boolean {
    return this.transactionMethods.has(method)
  }

  /**
   * Get the underlying read provider (for debugging)
   */
  getReadProvider(): Eip1193Provider {
    return this.readProvider
  }

  /**
   * Get the underlying write provider (for debugging)
   */
  getWriteProvider(): Eip1193Provider {
    return this.writeProvider
  }
}
