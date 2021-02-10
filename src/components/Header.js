import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AddBox from '@material-ui/icons/AddBox';
import ArtistForm from '../form/ArtistForm';
import Button from './controls/Button';
import Popup from './Popup';
import * as artistService from '../components/services/ArtistService';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function MenuAppBar(props) {

  const classes = useStyles();
  const [openPopup, setOpenPopup] = useState(false);
  const [buffer, setBuffer] = useState(null)
  const [auth, setAuth] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const addOrEdit = (design, resetForm) => {
    artistService.insertArtwork(design)
    resetForm() 
    setOpenPopup(false) 
  }

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Designs
          </Typography>
          {auth && (
            <div>
              <Button
              text="Add New"
              color="inherit"
              startIcon={<AddBox />}
              className ={classes.newButton}
              onClick={() => setOpenPopup(true)}/>
            </div>
          )}
        </Toolbar>
      </AppBar>
      <Popup
        title = "Add Design"
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
        >
          <ArtistForm
          addOrEdit={addOrEdit}/>
      </Popup>
    </div>
  );
}
