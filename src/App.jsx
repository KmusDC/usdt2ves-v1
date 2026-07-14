import { useEffect, useState } from 'react'
import logo from './assets/binanceLogo.png'

function App() {
  const [price, setPrice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function fetchPrice() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            asset: 'USDT',
            fiat: 'VES',
            tradeType: 'BUY',
            page: 1,
            rows: 6,
            payTypes: [],
            publisherType: null,
            transAmount: 1000,
          }),
        })

        if (!response.ok) {
          throw new Error('No se pudo obtener el precio actual.')
        }

        const data = await response.json()
        const ads = Array.isArray(data?.data) ? data.data : []
        const validPrices = ads
          .map((ad) => Number(ad?.adv?.price ?? ad?.price))
          .filter((value) => Number.isFinite(value))

        if (validPrices.length === 0) {
          throw new Error('No hay anuncios disponibles en este momento.')
        }

        const usdtInVes = Number(Math.max(...validPrices).toFixed(2))

        if (active) {
          setPrice({
            value: usdtInVes,
            updatedAt: new Date().toLocaleTimeString('es-VE', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          })
        }
      } catch {
        if (active) {
          setError('No se pudo obtener el precio actual. Intenta de nuevo.')
          setPrice(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchPrice()
    const intervalId = window.setInterval(fetchPrice, 15000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <img src={logo} alt="Binance Logo" style={{padding: '16px'}} />
        <p style={styles.eyebrow}>USDT / VES</p>
        <h1 style={styles.title}>Tasa Binance:</h1>

        {loading && !price && <p style={styles.status}>Actualizando precio...</p>}
        {error && !price && <p style={styles.error}>{error}</p>}

        {price && (
          <>
            <div style={styles.priceBox}>
              <strong style={styles.price}>{price.value.toLocaleString('es-VE', { maximumFractionDigits: 2 })}</strong>
              <span style={styles.currency}>Bolívares</span>
            </div>
            <p style={styles.meta}>Última actualización: {price.updatedAt}</p>
          </>
        )}

        <p style={styles.footer}>© {new Date().getFullYear()} - creado por Kmus</p>
      </section>
    </main>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffff',
    color: '#f8fafc',
    fontFamily: 'Inter, Arial, sans-serif',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    background: 'rgba(15, 23, 42, 0.92)',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    borderRadius: '24px',
    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.35)',
    padding: '32px',
    textAlign: 'center',
  },
  eyebrow: {
    margin: '0 0 8px',
    fontSize: '0.8rem',
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: '#38bdf8',
  },
  title: {
    margin: '0 0 24px',
    fontSize: '1.8rem',
    color: '#58B9ED',
  },
  status: {
    color: '#cbd5e1',
  },
  error: {
    color: '#fda4af',
  },
  priceBox: {
    background: 'rgba(59, 130, 246, 0.16)',
    borderRadius: '18px',
    padding: '24px',
    marginBottom: '16px',
  },
  price: {
    display: 'block',
    fontSize: '2.6rem',
    fontWeight: 700,
    marginBottom: '6px',
    color: '#24F239',
  },
  currency: {
    fontSize: '1rem',
    color: '#bae6fd',
  },
  meta: {
    color: '#cbd5e1',
    fontSize: '0.95rem',
  },
  footer: {
    marginTop: '20px',
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
}

export default App
