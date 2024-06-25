import { Map } from 'react-map-gl'
import './App.css'

// import mapbox css
import 'mapbox-gl/dist/mapbox-gl.css'
import { useEffect, useState } from 'react'
import { fromUrl } from 'geotiff'


// hard-coding the image urls here - they would come from supabase
const imageUrls = [
  'https://cogs.camels-de.org/cog_1_4cm_50.tif',
  'https://cogs.camels-de.org/cog_1_4cm_60.tif',
  'https://cogs.camels-de.org/cog_1_4cm_75.tif',
]

// map the overviews here - this is not yet the real data
const zoomToResolution = (zoom: number) => {
  if (zoom < 12) return [12, 1000]
  if (zoom < 15) return [15, 100]
  if (zoom < 16) return [16, 10]
  if (zoom < 18) return [17, 1]
  if (zoom < 19) return [18, 0.1]
  return [19, 0.04]
}


type Preview = [Uint8Array, Uint8Array, Uint8Array]

const App: React.FC = () => {
  // these are the images urls that come from the database
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)

  // add a control to select the zoom level
  const [zoomLevel, setZoomLevel] = useState<number>(6)

  // we create a preview here and manage the used Zoom level
  const [previewBands, setPreviewBands] = useState<Preview>([new Uint8Array(0), new Uint8Array(0), new Uint8Array(0)])
  const [usedZoom, setUsedZoom] = useState<number>(6)

  // development
  useEffect(() => {
    // if no images is selected, return
    if (!selectedImageUrl) return

    // check if a new zoom level is selected
    const [ zoom ] = zoomToResolution(zoomLevel)
    if (zoom === usedZoom) return

    // load from url
    fromUrl(selectedImageUrl)
    .then(img => {
      console.log(img)

      // get the resolution for this zoom level
      const [zoom, res] = zoomToResolution(zoomLevel)
      
      // save the last used zoom
      setUsedZoom(zoom)

      // reach out to get the Raster
      return img.readRasters({
        resX: res,
        resY: res
      } as unknown as any)
    }).then((raster) => {
      setPreviewBands([raster[0] as Uint8Array, raster[1] as Uint8Array, raster[2] as Uint8Array])
      
    })
  }, [selectedImageUrl, usedZoom, zoomLevel])



  return <>
      <div style={{width: '100vw', height: '100vh', display: 'flex', flexDirection: 'row'}}>
        
        <div style={{width: '50%', maxWidth: '450px', height: '100%', padding: '1rem', boxSizing: 'border-box'}}>
          <select value={selectedImageUrl || 'none'} onChange={e => setSelectedImageUrl(e.target.value === 'none' ? null : e.target.value)}>
            <option value="none">Keines ausgewählt</option>
            {imageUrls.map((url, idx) => (
              <option key={idx} value={url}>{url.split('/').slice(-1)}</option>
            ))}
          </select>
          <div> Current zoom: {zoomLevel?.toFixed(1)}</div>
        </div>

        <Map
        mapboxAccessToken='pk.eyJ1IjoiaHlkcm9jb2RlLWRlIiwiYSI6ImNrZXlkbHlxOTA0NjgyeG8wdmY0ZXMwNHQifQ.AnQmDk2NgkfEGdADSClnfQ'
          style={{width: '100%', height: '100%', flexGrow: 1}}
          initialViewState={{
            longitude: 7.8,
            latitude: 48,
            zoom: 6,
            pitch: 45
          }}
          mapStyle={'mapbox://styles/mapbox/satellite-v9'}
          onZoom={e => setZoomLevel(e.target.getZoom())}
        >

        </Map>
      </div>
    </>
}

export default App
