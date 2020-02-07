import React, { useState } from "react";
import clsx from 'clsx';
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
import "./style.css";

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    width: 200,
  },
  searchTextField: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    width: 500,
  },
  selectEmpty: {
   
  },
  selectFormControl: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    minWidth: 200,
  },
  buttonFormWrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
}));

function Search() {
  const classes = useStyles();

  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
  });

  const timer = React.useRef();
  React.useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  const [selectedStartDate, handleStartDateChange] = useState(new Date());
  const [selectedEndDate, handleEndDateChange] = useState(new Date());
  const [maxCount, setMaxCount] = React.useState(1);
  const [bucketName, setBucketName] = useState("");
  const [filter, setFilter] = useState("");

  const buttonClick = () => {
    if (!loading) {
      setSuccess(false);
      setLoading(true);
      timer.current = setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 2000);
    }
    /*setSuccess(false);
    setLoading(true);
    fetch("https://jsonplaceholder.typicode.com/todos/1")
    .then(() => {
      setSuccess(true);
      setLoading(false);
    })*/
      //.then(response => response.json())
      //.then(json => setTitle(json.title));
  };

  const handleMaxCountChange = event => {
    setMaxCount(event.target.value);
  };

  return (
    <div className="main">
    <div className="centered">
      <TextField
        id="searchText"
        label="Filter"
        className={classes.searchTextField}
        onChange={e => {
          setFilter(e.target.value);
        }}
      />
       <TextField
        id="bucket"
        label="Bucket"
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
          <MenuItem value={200}>200</MenuItem>
        </Select>
    </FormControl>
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DateTimePicker 
      value={selectedStartDate} 
      onChange={handleStartDateChange} 
      id="start"
        label="Start(Optional)"/>
    </MuiPickersUtilsProvider>
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DateTimePicker 
      value={selectedEndDate} 
      onChange={handleEndDateChange} 
      id="end"
        label="End(Optional)"/>
    </MuiPickersUtilsProvider>
    <div className={classes.buttonFormWrapper}>
      <Button 
      variant="contained" 
      color="primary" 
      size="large" 
      className={buttonClassname}
      disabled={loading}
      onClick={buttonClick}>
        Search
      </Button>
      {loading && <CircularProgress size={24} />}
      </div>
    </div>
    </div>
  );
}

export default Search;
