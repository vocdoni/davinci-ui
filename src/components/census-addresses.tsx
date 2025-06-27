import { Plus, X } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface CustomAddressesManagerProps {
  addresses: string[]
  setAddresses: (addresses: string[]) => void
}

export const CustomAddressesManager = ({ addresses, setAddresses }: CustomAddressesManagerProps) => {
  const addAddress = () => {
    setAddresses([...addresses, ''])
  }

  const removeAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index))
  }

  const updateAddress = (index: number, value: string) => {
    setAddresses(addresses.map((addr, i) => (i === index ? value : addr)))
  }

  return (
    <div className='space-y-3'>
      <Label className='text-davinci-black-alt'>Allowed Ethereum Addresses</Label>
      {addresses.map((address, index) => (
        <div key={index} className='flex gap-2'>
          <Input
            placeholder='0x...'
            value={address}
            onChange={(e) => updateAddress(index, e.target.value)}
            className='border-davinci-callout-border flex-1'
          />
          {addresses.length > 1 && (
            <Button
              type='button'
              variant='outline'
              size='icon'
              onClick={() => removeAddress(index)}
              className='border-davinci-callout-border hover:bg-davinci-soft-neutral/20'
            >
              <X className='w-4 h-4' />
            </Button>
          )}
        </div>
      ))}
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={addAddress}
        className='border-davinci-callout-border text-davinci-black-alt hover:bg-davinci-soft-neutral/20'
      >
        <Plus className='w-4 h-4 mr-1' />
        Add Address
      </Button>
    </div>
  )
}
