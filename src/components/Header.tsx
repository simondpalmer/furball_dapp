import { List, ListItem } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import InputBase from "@material-ui/core/InputBase";
import { fade, makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import AddBox from "@material-ui/icons/AddBox";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import React, { useEffect, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { getArtistFromAccountId } from "../api/token";
import ArtistForm from "../form/ArtistForm";
import { login, logout } from "../utils";
import BoxButton from "./controls/Button";
import Popup from "./Popup";

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  list: {
    width: 250,
  },
  fullList: {
    width: "auto",
  },
}));

export interface HeaderProps {
  auth: boolean;
}

export function Header(auth: HeaderProps) {
  const classes = useStyles();
  const [openPopup, setOpenPopup] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [searchCid, setSearchCid] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSubmit = () => {
    setRedirect(true);
  };

  if (redirect) {
    return <Redirect push to={`/artwork/:${searchCid}`} />;
  }

  const setDrawerState = (newDrawerState: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent
  ) => {
    if (
      event &&
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    setDrawerOpen(newDrawerState);
  };

  const drawerList = (
    <div
      className={classes.list}
      role="presentation"
      onClick={setDrawerState(true)}
      onKeyDown={setDrawerState(false)}
    >
      <List>
        <ListItem button key="Home">
          <Link to="/ ">Home</Link>
        </ListItem>
        <ListItem button key="Lookup">
          <Link to="/lookup">Lookup</Link>
        </ListItem>
        {window.walletConnection.isSignedIn() && (
          <>
            <ListItem button key="Gallery">
              <Link to={`user/${window.accountId}`}>Your Gallery</Link>
            </ListItem>
            <ListItem button key="Profile">
              <Link to="/">Your Profile</Link>
            </ListItem>
          </>
        )}
      </List>
    </div>
  );

  const rhs = auth ? (
    <>
      <BoxButton
        text="Add New"
        color="inherit"
        startIcon={<AddBox />}
        className={classes.menuButton}
        onClick={() => setOpenPopup(true)}
      />
      <Button color="inherit" onClick={logout}>
        Logout
      </Button>
    </>
  ) : (
    <Button color="inherit" onClick={login}>
      Login
    </Button>
  );

  return (
    <div className={classes.grow}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={setDrawerState(true)}
          >
            <MenuIcon />
          </IconButton>

          <SwipeableDrawer
            anchor="left"
            open={drawerOpen}
            onClose={setDrawerState(false)}
            onOpen={setDrawerState(true)}
          >
            {drawerList}
          </SwipeableDrawer>
          <Typography variant="h6" className={classes.title}>
            Furball
          </Typography>
          <form
            className={classes.search}
            onChange={(e) => setSearchCid(e.target.value)}
            onSubmit={handleSubmit}
          >
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ "aria-label": "search" }}
            />
          </form>
          <div className={classes.grow} />
          {rhs}
        </Toolbar>
      </AppBar>
      <Popup
        title="Add Design"
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
      >
        <ArtistForm />
      </Popup>
    </div>
  );
}
