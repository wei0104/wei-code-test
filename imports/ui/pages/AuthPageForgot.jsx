import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router';
import { Accounts } from 'meteor/accounts-base';
import i18n from 'meteor/universe:i18n';
import BaseComponent from '../components/BaseComponent.jsx';

import AuthPage from './AuthPage.jsx';

export default class ForgotPage extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = Object.assign(this.state, { errors: {}, send: false, coolDown: 0 });
    this.interval = null;
    this.countDown = this.countDown.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  countDown() {
    const coolDown = this.state.coolDown;
    if (coolDown != 0){
      this.setState({
        coolDown: coolDown - 1
      });
    } else {
      Meteor.clearInterval(this.interval);
      this.setState({
        send: false
      });
    }
  }

  onSubmit(event) {
    event.preventDefault();
    const email = this.email.value;
    const errors = {};

    if (!email) {
      errors.email = i18n.__('pages.authPageForgot.emailRequired');
    }

    this.setState({ errors });
    if (Object.keys(errors).length) {
      return;
    }

    Accounts.forgotPassword({
        email,
      }, (err) => {
      if (err) {
        this.setState({
          errors: { none: err.reason },
        });
      } else {
        this.setState({
          send: true,
          coolDown: 10
        });
        this.interval = Meteor.setInterval(() => { 
          this.countDown();
        }, 1000);
      }
    });
  }

  render() {
    const { errors, send } = this.state;
    const errorMessages = Object.keys(errors).map(key => errors[key]);
    const errorClass = key => errors[key] && 'error';

    const content = (
      <div className="wrapper-auth">
        <h1 className="title-auth">
          {i18n.__('pages.authPageForgot.forgot')}
        </h1>
        <p className="subtitle-auth">
          { send
            ? i18n.__('pages.authPageForgot.sendSuccess')
            : i18n.__('pages.authPageForgot.resetReason')
          }
        </p>
        <form onSubmit={this.onSubmit}>
          <div className="list-errors">
            {errorMessages.map(msg => (
              <div className="list-item" key={msg}>{msg}</div>
            ))}
          </div>
          <div className={`input-symbol ${errorClass('email')}`}>
            <input
              type="email"
              name="email"
              ref={(c) => { this.email = c; }}
              placeholder={i18n.__('pages.authPageForgot.yourEmail')}
            />
            <span
              className="icon-email"
              title={i18n.__('pages.authPageForgot.yourEmail')}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={send}>
            { send
              ? i18n.__('pages.authPageForgot.reSend') + this.state.coolDown + 's'
              : i18n.__('pages.authPageForgot.sendButton')
            }
          </button>
        </form>
      </div>
    );

    const link = (
      <Link to="/join" className="link-auth-alt">
        {i18n.__('pages.authPageSignIn.needAccount')}
      </Link>
    );

    return <AuthPage content={content} link={link} />;
  }
}

ForgotPage.contextTypes = {
  router: React.PropTypes.object,
};
