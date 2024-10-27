import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'AI-Powered Product Name, Description & Image Generator'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              fontSize: '60px',
              marginRight: '20px',
            }}
          >
            🎨
          </span>
        </div>
        <h1
          style={{
            fontSize: '60px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '20px',
            color: 'black',
          }}
        >
          AI Product Description & Image Generator
        </h1>
        <p
          style={{
            fontSize: '32px',
            textAlign: 'center',
            color: '#666',
            maxWidth: '800px',
          }}
        >
          Generate multilingual product names, descriptions, and background replacements using AI
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 24px',
              backgroundColor: '#000',
              color: 'white',
              borderRadius: '99px',
              fontSize: '24px',
            }}
          >
            Powered by OpenAI, Llama 3.2 Vision & Replicate
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}