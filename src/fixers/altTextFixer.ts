import { framer } from 'framer-plugin'

const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_MODEL = 'claude-3-sonnet-20240229'

async function callAnthropicForAlt(imageUrl: string | null, apiKey: string, nodeName?: string) {
  const content: any[] = [
    {
      type: 'text',
      text: [
        'Generate concise, descriptive alt text for the provided image.',
        'Focus on the primary subject, actions, and any useful context.',
        'Limit the response to 1 short sentence under 125 characters.'
      ]
        .join(' ') + (nodeName ? `\nLayer name/context: ${nodeName}` : '')
    }
  ]

  if (imageUrl) {
    content.push({
      type: 'image',
      source: { type: 'url', url: imageUrl }
    })
  }

  const body = {
    model: ANTHROPIC_MODEL,
    max_tokens: 150,
    temperature: 0.2,
    messages: [
      {
        role: 'user',
        content
      }
    ]
  }

  const resp = await fetch(ANTHROPIC_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  })

  if (!resp.ok) {
    const txt = await resp.text()
    throw new Error(`Anthropic API error: ${resp.status} ${txt}`)
  }

  const data = await resp.json()
  const blocks = Array.isArray(data?.content) ? data.content : []
  const textBlock = blocks.find((block: any) => block?.type === 'text' && block.text)
  const text = textBlock?.text || ''
  return typeof text === 'string' ? text.trim() : ''
}

export async function generateAltTextForNode(nodeId: string) {
  const node = await framer.getNode?.(nodeId)
  if (!node) throw new Error('Node not found')
  const nodeData: any = node

  const key = `alt-${nodeId}`
  const previous = await framer.getPluginData?.(key)

  // Check for stored API key in plugin data
  const apiKey = await framer.getPluginData?.('anthropicApiKey')
  let alt = ''

  if (apiKey) {
    try {
      const bgImage = typeof nodeData.backgroundImage === 'string' ? nodeData.backgroundImage : ''
      const hasRemoteImage =
        typeof bgImage === 'string' &&
        (bgImage.startsWith('http://') || bgImage.startsWith('https://') || bgImage.startsWith('data:'))
      const imageUrl = hasRemoteImage ? bgImage : null
      alt = await callAnthropicForAlt(imageUrl, apiKey, nodeData?.name)
    } catch (err) {
      console.warn('Anthropic call failed, falling back to stub', err)
      alt = `Generated alt text (fallback): ${nodeData?.name || 'image'}`
    }
  } else {
    // No API key configured -> fallback stub
    alt = `Generated alt text (stub): ${nodeData?.name || 'image'}`
  }

  await framer.setPluginData?.(key, alt)
  framer.notify('Alt text generated', { variant: 'success' })

  return { nodeId, key, previousValue: previous ?? null, newValue: alt }
}
