import { Plus, X } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { LabeledSwitch } from './ui/labeled-switch'

interface CustomAddressesManagerProps {
  addresses: string[]
  weights: string[]
  useWeightedVoting: boolean
  setAddresses: (addresses: string[]) => void
  setWeights: (weights: string[]) => void
  setUseWeightedVoting: (useWeighted: boolean) => void
}

export const CustomAddressesManager = ({
  addresses,
  weights,
  useWeightedVoting,
  setAddresses,
  setWeights,
  setUseWeightedVoting,
}: CustomAddressesManagerProps) => {
  const addAddress = () => {
    setAddresses([...addresses, ''])
    setWeights([...weights, '1'])
  }

  const removeAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index))
    setWeights(weights.filter((_, i) => i !== index))
  }

  const updateAddress = (index: number, value: string) => {
    setAddresses(addresses.map((addr, i) => (i === index ? value : addr)))
  }

  const updateWeight = (index: number, value: string) => {
    setWeights(weights.map((weight, i) => (i === index ? value : weight)))
  }

  const handleWeightedVotingChange = (enabled: boolean) => {
    setUseWeightedVoting(enabled)
    // Ensure weights array matches addresses length
    if (enabled && weights.length !== addresses.length) {
      const newWeights = addresses.map((_, index) => weights[index] || '1')
      setWeights(newWeights)
    }
  }

  return (
    <div className='space-y-3'>
      <Label className='text-davinci-black-alt'>Allowed Ethereum Addresses</Label>
      {addresses.map((address, index) => (
        <div key={index} className='flex gap-2 items-center'>
          <Input
            placeholder='0x...'
            value={address}
            onChange={(e) => updateAddress(index, e.target.value)}
            className='border-davinci-callout-border flex-1'
          />
          {useWeightedVoting && (
            <Input
              type='number'
              min='1'
              step='1'
              placeholder='1'
              value={weights[index] || '1'}
              onChange={(e) => updateWeight(index, e.target.value || '1')}
              className='border-davinci-callout-border w-24'
            />
          )}
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
      <div className='flex justify-between items-center'>
        <LabeledSwitch
          id='use-weighted-custom-addresses'
          checked={useWeightedVoting}
          onCheckedChange={handleWeightedVotingChange}
          leftLabel='Equal weight'
          rightLabel='Custom weight'
        />
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
    </div>
  )
}
