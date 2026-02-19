
import styles from './App.module.css';

import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from "react-leaflet";
import { useRef } from 'react'
import { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { ToastContainer, toast } from 'react-toastify';
import Modal from 'react-modal';
import { registerPinAPI, loginAPI, registerAPI, logoutAPI, authAPI, pinsAPI } from './Api.js'
import { customStyles, defaultPin, selectedPin, defaultMarkerPosition, map_center, sw_corner, ne_corner } from './Defaults.js'
import { Link } from 'react-router-dom'
import { ClipLoader } from "react-spinners";

const App = () => {

  const [loggedIn, setLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState({
    id: "",
    username: "",
    isAdmin: false
  });

  const override = {
    display: "block",
    margin: "0 auto",
  };

  useEffect(() => {

    checkForLogin()
    getPins()

  }, [])

  const [markers, setMarkers] = useState([])
  const [selectedFile, setSelectedFile] = useState(null);
  const [displayFile, setDisplayFile] = useState(null);
  const [modalIsOpen, setIsOpen] = useState(false);

  const [tab, setTab] = useState(1);

  const animateRef = useRef(true)
  const loginRef = useRef(null)
  const registerRef = useRef(null)

  const [markerPosition, setMarkerPosition] = useState([
    defaultMarkerPosition[0], defaultMarkerPosition[1]
  ])
  const [showMarker, setShowMarker] = useState(false);
  const [pinName, setPinName] = useState("");
  const [loading, setLoading] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const handleSetTab = () => {

    setTab(tab === 1 ? 2 : 1);
  }

  const openLogInTab = () => {
    openModal()
  }

  const fileInputRef = useRef(null);

  const onFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setDisplayFile(URL.createObjectURL(event.target.files[0]));
  };

  const handlePinChange = (e) => {
    setPinName(e.target.value)
  }

  function SetViewOnClick({ animateRef }) {
    const map = useMapEvent('click', (e) => {
      map.setView(e.latlng, map.getZoom(), {
        animate: animateRef.current || false,
      })
    })

    return null
  }

  const deleteMarker = () => {

    setMarkerPosition([defaultMarkerPosition[0], defaultMarkerPosition[1]])
    setShowMarker(false)

  }

  async function addNewPin(e) {

    e.preventDefault();

    if (!loggedIn) {
      toast.error("Log in first");
      return;
    }

    if (showMarker === false) {
      toast.error("Place a marker first")

      return;
    }

    const formData = new FormData();

    formData.append("name", pinName)
    formData.append("lat", markerPosition[0])
    formData.append("lng", markerPosition[1])
    formData.append("pic", selectedFile)


    /*

    Code to display formdata

    for (var pair of formData.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }

    */

    try {

      setLoading(true)
      const res = await registerPinAPI(formData)
      console.log(res)
      toast("Successfully added marker")

    } catch (err) {

      const err_message = err.response.data.message
      toast.error(err_message)
      checkForLogin()

    } finally {
      setPinName("")
      deleteMarker()
      setLoading(false)
      setSelectedFile(null)
      setDisplayFile(null)
      fileInputRef.current.value = "";
    }

  }

  async function loginClick(e) {

    e.preventDefault()

    const username = loginRef.current.elements.user.value
    const password = loginRef.current.elements.pwd.value

    try {
      await loginAPI({ username, password })
      toast("Login successful")
      checkForLogin();

    } catch (err) {

      const error_message = err.response.data.error;
      toast.error("Login failed. " + error_message)
    } finally {
      closeModal();
    }
  }

  async function registerClick(e) {

    e.preventDefault()

    if (registerRef.current.elements.pwd.value !== registerRef.current.elements.pwd2.value) {
      toast.error("Passwords do not match")
      return;
    }

    const username = registerRef.current.elements.user.value
    const password = registerRef.current.elements.pwd.value

    try {

      await registerAPI({ username, password })
      toast("Registration successful")

    } catch (err) {

      const error_message = err.response.data.message
      toast.error("Error. " + error_message)

    } finally {

      closeModal()

    }
  }

  async function Logout() {

    try {
      await logoutAPI()
      toast("Logged out!")
      setLoggedIn(false)

    } catch (err) {

      console.log(err);
      toast.error(err.response.data.message)
    }

  }

  async function checkForLogin() {

    const response = await authAPI()

    if (response.data.loggedIn === true) {

      setUserDetails({
        id: response.data.id,
        username: response.data.username,
        isAdmin: response.data.isAdmin,
      })

      setLoggedIn(true);
    } else {
      setLoggedIn(false)
    }

  }

  async function getPins() {

    const res = await pinsAPI();
    setMarkers(res.data)
  }

  return (
    <div className={styles.App}>
      <ToastContainer position="bottom-left" />
      <div className={styles.main}>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Example Modal"
          class="modal-class"
        >

          {tab === 1 && (<form className={styles.formLogin} onSubmit={loginClick} ref={loginRef}>
            <h2>Login</h2>
            <label htmlFor="exampleFormControlInput1" class="form-label">Username</label>
            <Form.Control type="text" placeholder="Username" id="exampleFormControlInput1" name="user" required />
            <label htmlFor="exampleFormControlInput2" class="form-label">Password</label>
            <Form.Control type="password" placeholder="Password" id="exampleFormControlInput2" name="pwd" required />
            <Button variant="primary" id="buttonc" type="submit">Login</Button>
            <p className={styles.pc}>Click <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={handleSetTab}>here</span> to register</p>
          </form>)}

          {tab === 2 && (

            <form className={styles.formLogin} ref={registerRef} onSubmit={registerClick}>
              <h2>Register</h2>
              <label htmlFor="exampleFormControlInput3" class="form-label">Desired Username</label>
              <Form.Control type="text" placeholder="Username" id="exampleFormControlInput3" minLength={6}
                maxLength={20} name="user" required />
              <label htmlFor="exampleFormControlInput4" class="form-label">Desired Password</label>
              <Form.Control type="password" placeholder="Password" id="exampleFormControlInput3" name="pwd" minLength={6}
                maxLength={20} required />
              <label htmlFor="exampleFormControlInput5" class="form-label">Password Again</label>
              <Form.Control type="password" placeholder="Password" id="exampleFormControlInput5" name="pwd2" minLength={6}
                maxLength={20} required />
              <Button variant="primary" id="buttonc" type="submit">Register</Button>
              <p className={styles.pc} onClick={handleSetTab}>Back</p>
            </form>
          )}

        </Modal>
        <div className={styles.leftPanel}>
          {loggedIn ? <p className={styles.login} onClick={Logout}>Logout</p> : <p className={styles.login} onClick={openLogInTab}>Login</p>}
          <h2>Areas of Trash cans around Ekkamai area</h2>
          <div className={styles.mapContainer}>
            <MapContainer center={[map_center[0], map_center[1]]} zoom={15} scrollWheelZoom={true} style={{ height: "400px", width: "100%" }} minZoom={13} maxBounds={[
              sw_corner,
              ne_corner
            ]} >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {markers.map((pin) => {

                return <Marker key={pin.id} position={[pin['lat'], pin['lng']]} icon={defaultPin}>
                  <Popup><h3>{pin['name']}</h3><img src={pin['pic_link']} width={180} height={140} alt="hello"></img></Popup>
                </Marker>
              })}
              <SetViewOnClick animateRef={animateRef} />
              {showMarker && (<Marker
                draggable={true}
                position={markerPosition} icon={selectedPin} eventHandlers={{
                  dragend: (e) => {
                    const { lat, lng } = e.target.getLatLng();
                    setMarkerPosition([lat, lng])
                    console.log("Marker dragged to:", lat, lng);
                  },
                }}></Marker>)}

            </MapContainer>
          </div>

          <p style={{ visibility: showMarker ? "visible" : "hidden" }}>
            Marker latitude/longitude: {markerPosition[0]}, {markerPosition[1]}
          </p>

          {userDetails.isAdmin ? <Link to='/admin' style={{ textDecoration: "none", color: "inherit" }}> <Button variant="warning">Admin Dashboard</Button></Link> : ""}

        </div>
        <div className={styles.rightPanel}>
          <h2>Control Panel</h2>
          {loggedIn ? <p>Hello {userDetails.username}</p> : <p>You are not logged in.</p>}
          <p>Add new marker, remove marker, upload photos</p>
          <div style={{ display: "flex", gap: "12px", flexDirection: "row" }}>
            <Button variant="warning" onClick={() => setShowMarker(true)}>Insert new marker</Button>
            <Button variant="danger" onClick={() => deleteMarker()}>Remove marker</Button>
          </div>
          <h3>Upload</h3>
          <p>Register your pin as proof here.</p>
          <form onSubmit={addNewPin}>
            <Form.Control type="text" placeholder="Enter your pin name*" onChange={handlePinChange} value={pinName} required />
            <input type="file" accept="image/*" id="photo-upload" name="photo-upload" onChange={onFileChange} ref={fileInputRef} required />
            {selectedFile ? <img src={displayFile} alt="Uploaded preview" width={250} height={150} /> : ""}
            <Button variant="primary" type="submit" disabled={loading}>{loading ? <ClipLoader color={"white"} size={20} cssOverride={override} loading={loading} /> : "Submit"}</Button>
          </form>
        </div>
      </div>
    </div >
  );
};

export default App;