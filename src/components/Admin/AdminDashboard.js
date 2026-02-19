import "leaflet/dist/leaflet.css";
import styles from './Admin.module.css';
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import axios from 'axios'
import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button';
import { defaultPin, map_center, sw_corner, ne_corner } from '../Main/Defaults.js'
import { ToastContainer, toast } from 'react-toastify';

function AdminDashboard() {

  function getPins() {

    axios.get('http://localhost:3001/unapproved-pins', { withCredentials: true }).then((res) => {

      setPins(res.data)
    }
    ).catch((err) => {

      console.log(err.response)
    })

  }

  const [pins, setPins] = useState([])
  const [selectedPin, setSelectedPin] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    getPins()

  }, [])

  useEffect(() => {

    const x = pins.filter(pin => pin.id == selectedId);
    setSelectedPin(x[0])

  }, [selectedId])

  useEffect(() => {

    console.log(pins)

  }, [pins])

  async function deletePin() {


    if (selectedId == null) {

      toast.error("No pin selected")
      return
    }

    setLoading(true)

    axios.post('http://localhost:3001/delete-pin', { id: selectedId }, { withCredentials: true }).then((res) => {

      toast("Pin deleted")

    }).catch((err) => {

      console.log(err.response)
      toast.error("Error. " + err.response.data.message)
    }).finally(() => {

      setSelectedPin(null)
      setSelectedId(null)
      getPins()
      setLoading(false)
    })

  }


  async function approvePin() {

    if (selectedId == null) {

      toast.error("No pin selected")
      return
    }

    setLoading(true)

    axios.post('http://localhost:3001/approve-pin', { id: selectedId }, { withCredentials: true }).then((res) => {

      toast("Pin successfully approved")
    }).catch((err) => {

      console.log(err.response)
      toast.error("Error. " + err.response.data.message)
    }).finally(() => {

      setSelectedPin(null)
      setSelectedId(null)
      getPins()
      setLoading(false);
    })

  }

  return (<>
    <div className={styles.App}>
      <ToastContainer />
      <h1>Admin Dashboard</h1>
      <div className={styles.upperContainer}>
        <div className={styles.mapContainer}>
          <MapContainer key={map_center[0].toString()} center={[map_center[0], map_center[1]]} zoom={15} style={{ height: "300px", width: "100%" }} scrollWheelZoom={true} minZoom={13} maxBounds={[
            sw_corner,
            ne_corner
          ]} >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {selectedPin ? <Marker position={[selectedPin['lat'], selectedPin['lng']]} icon={defaultPin} /> : null}

          </MapContainer>
        </div>

        {selectedPin && (<div className={styles.imageContainer}>
          <img src={selectedPin.pic_link} />
        </div>)}

      </div>

      <div className={styles.tableContainer}>
        <h2>Unapproved Pins</h2>
        <div className={styles.tableStyle}>
          <table class="table table-hover">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col">Lat</th>
                <th scope="col">Lng</th>
                <th scope="col">Username</th>
              </tr>

            </thead>

            <tbody>

              {pins.map((pin) => (
                <tr onClick={() => setSelectedId(pin.id)} style={{
                  backgroundColor: "red", cursor: "pointer"
                }}>
                  <th scope="col" className={selectedId === pin.id ? styles.selectedRow : ""}> {pin.id}</th>
                  <th scope="col" className={selectedId === pin.id ? styles.selectedRow : ""}>{pin.name}</th>
                  <th scope="col" className={selectedId === pin.id ? styles.selectedRow : ""}>{pin.lat}</th>
                  <th scope="col" className={selectedId === pin.id ? styles.selectedRow : ""}>{pin.lng}</th>
                  <th scope="col" className={selectedId === pin.id ? styles.selectedRow : ""}>{pin.username}</th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", gap: "15px" }}>
          <Button onClick={approvePin} disabled={loading}>Approve</Button>
          <Button variant="danger" onClick={deletePin} disabled={loading}>Delete</Button>
        </div>
      </div>
    </div>

  </>)

};

export default AdminDashboard;