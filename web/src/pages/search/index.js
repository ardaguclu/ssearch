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
//import "./style.css";

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center'
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

  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const [selectedStartDate, handleStartDateChange] = useState(new Date());
  const [selectedEndDate, handleEndDateChange] = useState(new Date());
  const [maxCount, setMaxCount] = React.useState(20);
  const [bucketName, setBucketName] = useState("");
  const [filter, setFilter] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");

  const buttonClick = () => {
    setSuccess(false);
    setLoading(true);
    fetch(`http://localhost:7981/search?bucket=${encodeURIComponent(bucketName)}&filter=${encodeURIComponent(filter)}&result-count=${encodeURIComponent(maxCount)}&start=${encodeURIComponent(Math.floor(selectedStartDate / 1000))}&end=${encodeURIComponent(Math.floor(selectedEndDate / 1000))}`)
        .then(response => {
          if (!response.ok) {
            throw new Error("HTTP status= " + response.status + "message = " + response.text());
          }
          return response.json();
        })
        .then(json => {
          console.log("Retrieved items:");
          console.log(json);
        })
        .catch(error => {
          setModalDescription(error.toString());
          setModalTitle("Error");
          handleOpen();
        })
        .finally(() => {
          setSuccess(true);
          setLoading(false);
        });
  };

  const handleMaxCountChange = event => {
    setMaxCount(event.target.value);
  };

  return (
    <div className="container">
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
        Search
      </Button>
      {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
    </div>
      <Modal
          open={open}
          onClose={handleClose}
      >
        <div style={modalStyle} className={classes.modalPaper}>
          <h2 id="simple-modal-title">{modalTitle}</h2>
          <p id="simple-modal-description">
            {modalDescription}
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default Search;