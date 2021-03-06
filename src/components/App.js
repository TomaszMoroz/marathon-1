import React, { Component } from 'react';
import { Container, Alert } from 'reactstrap';
import './App.css';
import AppHeader from './AppHeader';
import Keyboard from './Keyboard';
import RoundPicker from './RoundPicker';
import NumberList from './NumberList.jsx';
import UserInfo from './UserInfo.jsx';
import { pushNumber, readNumbers, removeNumber } from '../services/numbers';
import { onUserChange } from '../services/firebase';

class App extends Component {
  constructor() {
    super();
    this.round = new Date();
    this.state = { numbers: [], user: null, alerts: [] };
    this.numberSent = this.numberSent.bind(this);
    this.roundSelected = this.roundSelected.bind(this);
    this.numberRemoved = this.numberRemoved.bind(this);
    this.removeNumber = this.removeNumber.bind(this);
    this.addNumber = this.addNumber.bind(this);

    onUserChange((user) => {
      this.setState({ user });
    });
  }

  displayAlert(alert) {
    this.setState((prevState) => {
      const newAlerts = prevState.alerts.slice();
      newAlerts.unshift(alert);
      return {
        alerts: newAlerts,
      };
    });

    setTimeout(() => this.setState((prevState) => {
      const newAlerts = prevState.alerts.slice();
      newAlerts.splice(0, 1);
      return {
        alerts: newAlerts,
      };
    }), 3000);
  }

  numberSent(number) {
    if (this.state.numbers.includes(number)) {
      return;
    }

    pushNumber(this.round, number).catch((err) => {
      this.displayAlert(`could not add number: ${err.code ? err.code : err}`);
      this.removeNumber(number);
    });
    this.addNumber(number);
  }

  numberRemoved(number) {
    this.removeNumber(number);
    removeNumber(this.round, number).catch((err) => {
      this.displayAlert(`could not remove number: ${err.code ? err.code : err}`);
      this.addNumber(number);
    });
  }

  addNumber(number) {
    this.setState((prevState) => {
      const newNumbers = prevState.numbers.slice();
      newNumbers.unshift(number);
      return {
        numbers: newNumbers,
      };
    });
  }

  removeNumber(number) {
    this.setState((prevState) => {
      const newNumbers = prevState.numbers.slice()
        .filter(val => number !== val);

      return {
        numbers: newNumbers,
      };
    });
  }

  roundSelected(date) {
    this.round = date;
    readNumbers(date).then((numbers) => {
      this.setState({ numbers });
    });
  }

  render() {
    return (
      <div className="App">
        <Container>
          <AppHeader />
          {this.state.alerts.map((alert, key) => (
            <Alert key={key} color="danger">
              {alert}
            </Alert>
          ))}
          <UserInfo user={this.state.user} />
          {this.state.user &&
            <div>
              <RoundPicker onRoundSelected={this.roundSelected} />
              <Keyboard onSave={this.numberSent} />
              <NumberList onRemoveNumber={this.numberRemoved} numbers={this.state.numbers}/>
            </div>
          }
        </Container>
      </div>
    );
  }
}

export default App;
