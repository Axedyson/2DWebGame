import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import { useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import styles from '../../src/css/styles.module.css';
import Box from '@material-ui/core/Box';


const ImageFileField = ({ form: { setFieldValue, errors: { image: imageError } } }) => {
  const [previewImage, setPreviewImage] = useState();
  const [open, setOpen] = useState(false);
  const [crop, setCrop] = useState();
  const [zoom, setZoom] = useState();

  const fileInputEl = useRef();
  const cropData = useRef();
  

  useEffect(() => {
    return () => {
      // Remove the image from memory, and clear the canvas, on every previous effect!
      // As long as the previewImage still exists and the reference to the canvas element exists
      if (previewImage) URL.revokeObjectURL(previewImage.src);
    };
  }, [previewImage]);
  
  const handleChange = ({ currentTarget: { files: [inputImage] } }) => {
    if (inputImage) {
      // Set the new image so formik can retrieve it for validation and for submission
      setFieldValue("image", inputImage);
      // Make sure that every new image has the default inital zoom level and crop settings
      setZoom(1);
      setCrop({x: 0, y: 0});
      // Set the new image preview
      setPreviewImage({ name: inputImage.name, src: URL.createObjectURL(inputImage), mime: inputImage.type});
      // Open the crop dialog at last
      setOpen(true);
    }
  };
  
  const cropImage = () => {
    const img = new Image();
    // Wait for the image to load when setting it's src
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = cropData.current.width;
      canvas.height = cropData.current.height;
      const ctx = canvas.getContext('2d');
      // Draw the image cropped with the cropData
      ctx.drawImage(
        img, 
        cropData.current.x, 
        cropData.current.y, 
        cropData.current.width, 
        cropData.current.height, 
        0, 
        0, 
        cropData.current.width, 
        cropData.current.height
      );
      canvas.toBlob(file => {
        setPreviewImage(state => ({...state, src: URL.createObjectURL(file)}));
      }, previewImage.mime);
    };
    img.src = previewImage.src;
  };
  
  const handleClose = () => {
    setOpen(false);
  };

  const handleAccept = () => {
    setFieldValue("cropData", cropData.current);
    cropImage();
    setOpen(false);
  };
  
  const handleRemove = () => {
    // Make sure crop dialog is closed because it will open on picture removal if imageError were true previously
    setOpen(false);
    // Remove the cropData so the user doesn't send unnecessary crop data along the request
    setFieldValue("cropData", null);
    // Make sure to set the image to null so the user
    // doesn't accidently submit the image that the user didn't want
    setFieldValue("image", null);
    // Make sure to remove the file completely from the input element
    fileInputEl.current.value = "";
    // And then of course remove the image preview
    setPreviewImage();
  };

  const handleMediaLoad = () => {
    setFieldValue("cropData", cropData.current);
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    cropData.current = croppedAreaPixels;
  };
  
  const handleSliderZoom = (event, newZoom) => {
    setZoom(newZoom);
  };
  
  return (
    <>
      <Grid container item justify="space-between" alignItems="center">
        {previewImage &&
          <Grid item>
            <Button variant="contained" color="primary" onClick={handleRemove}>Remove</Button>
          </Grid>
        }
        {previewImage &&
          <Grid item>
            <Box px={2}>
              <Avatar title={previewImage.name} alt={previewImage.name} src={previewImage.src} className={styles.pfp} />
            </Box>
          </Grid>
        }
        <Grid item>
          <Button variant="contained" color="primary" component="label" htmlFor="image">{previewImage ? "Change" : "Upload"}</Button>
          <input ref={fileInputEl} accept="image/jpg,image/jpeg,image/png" id="image" type="file" onChange={handleChange} />
        </Grid>
      </Grid>
      {imageError && <Grid item><FormHelperText error>{imageError}</FormHelperText></Grid>}
      <Dialog open={!imageError && open} onClose={handleClose} aria-labelledby="crop-image-dialog" fullWidth>
        <DialogTitle id="crop-image-dialog">Crop Image</DialogTitle>
        <DialogContent className="crop-image-container" dividers>
          {!imageError && previewImage &&
            <Cropper
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              onMediaLoaded={handleMediaLoad}
              mediaProps={{alt: previewImage.name, title: previewImage.name}}
              image={previewImage.src}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape='round'
            />
          }
        </DialogContent>
        <DialogContent dividers>
          <Typography id="zoom-slider">Adjust Zoom Level</Typography>
          <Slider value={zoom} onChange={handleSliderZoom} aria-labelledby="zoom-slider" min={1} max={3} step={0.05}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleAccept} color="primary">Accept</Button>
        </DialogActions>
      </Dialog>
      <style jsx global>{`
        .crop-image-container {
          height: 420px;
          position: relative;
        }
        #image {
          display: none;
        }
      `}</style>
    </>
  );
};

export default ImageFileField;