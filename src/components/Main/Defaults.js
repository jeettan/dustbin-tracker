import { Icon } from 'leaflet'

export const sw_corner = [13.690, 100.530]
export const ne_corner = [13.800, 100.650]
export const map_center = [13.726505166739049, 100.58380122844527]
export const defaultMarkerPosition = [13.725836300080076, 100.58303117752077]

export const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '400px',
  }, overlay: {
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.5)'
  }
};

export const defaultPin = new Icon({

  iconUrl: "/pin.svg",
  iconSize: [38, 38]
})

export const selectedPin = new Icon({

  iconUrl: "/pin_selected.svg",
  iconSize: [38, 38]
})