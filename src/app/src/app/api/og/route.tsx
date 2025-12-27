import { ImageResponse } from 'next/server';

export async function GET() {
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
          fontSize: 80,
          fontWeight: 'bold',
          color: '#f59e0b',
          fontFamily: 'sans-serif',
        }}
      >
        🍩 Donut Counter
      </div>
    ),
    {
      width: 800,
      height: 600,
    }
  );
}
