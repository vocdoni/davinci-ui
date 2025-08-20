import { CheckCircle, Mail } from 'lucide-react'
import type React from 'react'
import { useForm } from 'react-hook-form'
import MailchimpSubscribe from 'react-mailchimp-subscribe'

import { Button } from '~components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~components/ui/card'
import { Input } from '~components/ui/input'

const MAILCHIMP_URL = import.meta.env.PUBLIC_MAILCHIMP_URL ?? ''

export function NewsletterCard() {
  return (
    <MailchimpSubscribe
      url={MAILCHIMP_URL}
      render={({ subscribe, status, message }) => <Form status={status} message={message} onValidated={subscribe} />}
    />
  )
}

interface FormData {
  email: string
}

function Form({
  status,
  message,
  onValidated,
}: {
  status: string | null
  message: string | Error | null
  onValidated: (formData: { EMAIL: string }) => void
}) {
  const form = useForm<FormData>({
    defaultValues: {
      email: ''
    }
  })

  const { register, handleSubmit, reset } = form

  const onSubmit = (data: FormData) => {
    if (!data.email.trim()) return
    onValidated({ EMAIL: data.email })
  }

  if (status === 'success') {
    return (
      <Card className='border-davinci-callout-border bg-davinci-digital-highlight/50'>
        <CardContent className='p-6 text-center'>
          <div className='flex flex-col items-center space-y-4'>
            <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
              <CheckCircle className='w-6 h-6 text-green-600' />
            </div>
            <div>
              <h3 className='font-semibold text-davinci-black-alt mb-2'>Thank you!</h3>
              <p className='text-sm text-davinci-black-alt/80'>
                You've been subscribed to our newsletter. We'll keep you updated on DAVINCI developments.
              </p>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                reset()
                window.location.reload()
              }}
              className='border-davinci-callout-border text-davinci-black-alt hover:bg-davinci-soft-neutral/20'
            >
              Subscribe Another Email
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='border-davinci-callout-border bg-davinci-paper-base/80'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-davinci-black-alt text-lg'>
          <Mail className='w-5 h-5' />
          Stay Updated
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <p className='text-sm text-davinci-black-alt/80'>
          Get the latest updates on DAVINCI protocol developments, new features, and other ecosystem opportunities.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-3'>
          <Input
            type='email'
            placeholder='Enter your email'
            {...register('email', { required: true })}
            className='border-davinci-callout-border'
          />
          <Button
            type='submit'
            className='w-full bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base'
            disabled={status === 'sending'}
          >
            {status === 'sending' ? (
              <>
                <div className='w-4 h-4 border-2 border-davinci-text-base/30 border-t-davinci-text-base rounded-full animate-spin mr-2' />
                Subscribing...
              </>
            ) : (
              <>
                <Mail className='w-4 h-4 mr-2' />
                Subscribe
              </>
            )}
          </Button>
        </form>

        {status === 'error' && (
          <p className='text-sm text-red-600' dangerouslySetInnerHTML={{ __html: String(message) }} />
        )}

        <p className='text-xs text-davinci-black-alt/60'>We respect your privacy. Unsubscribe at any time.</p>
      </CardContent>
    </Card>
  )
}
