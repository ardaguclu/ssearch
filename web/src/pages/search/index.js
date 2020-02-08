import React, { useState } from "react";
import CircularProgress from '@material-ui/core/CircularProgress';
import { green } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import DateFnsUtils from '@date-io/date-fns';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import Modal from '@material-ui/core/Modal';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InsertDriveFileSharpIcon from '@material-ui/icons/InsertDriveFileSharp';
import SSearchLogo from "../../img/logo_white_background.jpg";

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  textField: {
    marginTop: theme.spacing(10),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    width: 200,
  },
  searchTextField: {
    marginTop: theme.spacing(10),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    width: 500,
  },
  selectEmpty: {

  },
  selectFormControl: {
    marginTop: theme.spacing(10),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    minWidth: 200,
  },
  DatePicker: {
    marginTop: theme.spacing(10),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  buttonStandard: {
    marginTop: theme.spacing(10),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  buttonProgress: {
    margin: theme.spacing(1),
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  modalPaper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  logo: {
    width: '25%',
    alignItems: 'center',
    marginLeft: theme.spacing(75),
  }
}));

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

function Search() {
  const classes = useStyles();

  const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };

  const [items, setItems] = React.useState([]);
  const [elapsed, setElapsed] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [selectedStartDate, handleStartDateChange] = useState(new Date());
  const [selectedEndDate, handleEndDateChange] = useState(new Date());
  const [maxCount, setMaxCount] = React.useState(20);
  const [bucketName, setBucketName] = useState("");
  const [filter, setFilter] = useState("");
  const [modalDescription, setModalDescription] = useState("");

  const buttonClick = () => {
    setLoading(true);
    fetch(`http://localhost:7981/search?bucket=${encodeURIComponent(bucketName)}&filter=${encodeURIComponent(filter)}&result-count=${encodeURIComponent(maxCount)}&start=${encodeURIComponent(Math.floor(selectedStartDate / 1000))}&end=${encodeURIComponent(Math.floor(selectedEndDate / 1000))}`)
        .then(response => {
          return response.json();
        })
        .then(json => {
          if (json.status !== 200) {
            throw Error(json.result);
          }

          setItems(json.result);
          setElapsed("search completed in " + json.elapsed);
        })
        .catch(error => {
          setElapsed("");
          setItems([]);
          setModalDescription(error.toString());
          handleOpen();
        })
        .finally(() => {
          setLoading(false);
        });
  };

  const handleMaxCountChange = event => {
    setMaxCount(event.target.value);
  };

  return (
    <div className="container">
      <img className={classes.logo} src={SSearchLogo} />
    <div className="centered">
      <TextField
        id="searchText"
        label="Type the text you want to search in S3"
        helperText="Required, len() > 3"
        className={classes.searchTextField}
        onChange={e => {
          setFilter(e.target.value);
        }}
      />
       <TextField
        id="bucket"
        label="Bucket Name"
        helperText="Required"
        className={classes.textField}
        onChange={e => {
          setBucketName(e.target.value);
        }}
      />
          <FormControl className={classes.selectFormControl}>
    <InputLabel id="maxCount">Max Count</InputLabel>
    <Select
          labelId="maxCount"
          id="maxCount"
          value={maxCount}
        
          onChange={handleMaxCountChange}
          className={classes.selectEmpty}
        >
          <MenuItem value={1}>1</MenuItem>
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
          <MenuItem value={200}>500</MenuItem>
        </Select>
    </FormControl>
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DateTimePicker 
      className={classes.DatePicker}
      value={selectedStartDate} 
      helperText="Optional"
      onChange={handleStartDateChange} 
      id="start"
        label="Start"/>
    </MuiPickersUtilsProvider>
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DateTimePicker 
      className={classes.DatePicker}
      value={selectedEndDate}
      helperText="Optional" 
      onChange={handleEndDateChange} 
      id="end"
        label="End"/>
    </MuiPickersUtilsProvider>
    <Button 
      variant="contained" 
      color="primary" 
      size="large" 
      className={classes.buttonStandard}
      disabled={loading}
      onClick={buttonClick}>
        Do It!
      </Button>
      {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
    </div>
      <div className="container">
        <List component="nav" className={classes.root} aria-label="results">
        {items.map(item => (
            <ListItem alignItems="flex-start">
              <ListItemIcon>
                <InsertDriveFileSharpIcon />
              </ListItemIcon>
              <ListItemText primary={item.Key}
                            secondary={
                <React.Fragment>
                  <InputLabel>Last Modified: {item.LastModified}</InputLabel>

                  <InputLabel>Size: {item.Size} Bytes</InputLabel>
                </React.Fragment>
              } />
            </ListItem>
        ))}
        </List>
        <InputLabel>{elapsed}</InputLabel>
      </div>
      <Modal open={open} onClose={handleClose}>
        <div style={modalStyle} className={classes.modalPaper}>
          <p id="simple-modal-description">
            {modalDescription}
          </p>
        </div>
      </Modal>
    </div>
);
}

export default Search;
