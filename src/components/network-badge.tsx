import { useAppKitNetwork } from '@reown/appkit/react'
import { Select, SelectContent, SelectItem, SelectTrigger } from '~components/ui/select'
import { useSequencerNetwork } from '~contexts/sequencer-network'

/**
 * Network badge component that displays the current network name
 * Shows next to the logo in the header
 */
export function NetworkBadge() {
  const { caipNetwork } = useAppKitNetwork()
  const {
    availableSequencerNetworkOptions,
    selectedSequencerNetwork,
    setSelectedSequencerNetwork,
  } = useSequencerNetwork()

  /**
   * Get color classes based on network type
   * Mainnet: green, Testnets: orange/yellow
   */
  const getNetworkColor = (name: string): string => {
    const lowerName = name.toLowerCase()

    if (lowerName.includes('mainnet') || lowerName === 'ethereum') {
      return 'bg-green-100 text-green-700 border-green-200'
    }

    // Testnets and other networks
    return 'bg-orange-100 text-orange-700 border-orange-200'
  }

  if (!selectedSequencerNetwork) {
    return null
  }

  const selectedName = selectedSequencerNetwork.name.replace(' Mainnet', '')
  const selectedNameShort = (() => {
    const name = selectedName
    if (name === 'Arbitrum Sepolia') return 'Arb Sepolia'
    if (name === 'Arbitrum') return 'Arbitrum'
    if (name === 'Ethereum') return 'Ethereum'
    return name
  })()
  const connectedName = caipNetwork?.name.replace(' Mainnet', '')
  const title = caipNetwork
    ? `Target: ${selectedSequencerNetwork.name} (Chain ID: ${selectedSequencerNetwork.id}) · Connected: ${caipNetwork.name} (Chain ID: ${caipNetwork.id})`
    : `Target: ${selectedSequencerNetwork.name} (Chain ID: ${selectedSequencerNetwork.id})`

  return (
    <div className='hidden sm:flex items-center'>
      <Select value={String(selectedSequencerNetwork.id)} onValueChange={(value) => setSelectedSequencerNetwork(Number(value))}>
        <SelectTrigger
          className={`h-7 max-w-[150px] px-2 py-1 text-xs font-medium border ${getNetworkColor(
            selectedSequencerNetwork.name
          )}`}
          title={title}
        >
          <div className='flex items-center min-w-0'>
            <div className='w-1.5 h-1.5 rounded-full bg-current mr-1.5 shrink-0' />
            <span className='whitespace-nowrap'>{selectedNameShort}</span>
            {connectedName && connectedName !== selectedName && <span className='ml-1 text-[10px] opacity-80'>target</span>}
          </div>
        </SelectTrigger>
        <SelectContent>
          {availableSequencerNetworkOptions.map((option) => (
            <SelectItem key={option.chainId} value={String(option.chainId)} disabled={!option.network}>
              {option.network ? option.label : `${option.label} (not configured in app)`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
