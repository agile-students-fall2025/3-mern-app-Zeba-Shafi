import { useEffect, useState } from 'react'
import axios from 'axios'
import './Home.css'

const About = () => {
  const [about, setAbout] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_SERVER_HOSTNAME}/about`)
      .then(response => {
        setAbout(response.data.about)
      })
      .catch(err => {
        setError(JSON.stringify(err, null, 2))
      })
      .finally(() => setLoaded(true))
  }, [])

  if (!loaded) return <p>Loading...</p>
  if (error) return <p className="Messages-error">{error}</p>
  if (!about) return <p>No content available.</p>

  return (
    <article>
      <h1>{about.title}</h1>
      {about.imageUrl && (
        (() => {
          let src = about.imageUrl
          // If the back-end returned a relative path (starts with '/'),
          // prefix it with the server hostname so the browser requests the image
          // from the back-end rather than the React dev server.
          if (src && src.startsWith('/')) {
            const host = process.env.REACT_APP_SERVER_HOSTNAME || ''
            src = `${host}${src}`
          }
          return <img src={src} alt="About" style={{ maxWidth: '300px' }} />
        })()
      )}
      {about.paragraphs.map((p, idx) => (
        <p key={idx}>{p}</p>
      ))}
    </article>
  )
}

export default About
