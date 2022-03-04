import React from 'react';
import './App.css';
import CodeSubmit from './CodeSubmit'
import RegisterPage from './RegisterPage'

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isShowingRegisterPage: false,
            savedRequest: undefined,
            savedEmail: undefined
        }

        this.handleGoToRegisterPage = this.handleGoToRegisterPage.bind(this);
        this.handleLeaveRegisterPage = this.handleLeaveRegisterPage.bind(this);
        this.handleFinishedSendingExternalPayload = this.handleFinishedSendingExternalPayload.bind(this);
    }

    handleGoToRegisterPage(requestPayload, emailAddress) {
        this.setState({
            isShowingRegisterPage: true,
            savedRequest: requestPayload,
            savedEmail: emailAddress,
        });
    }

    handleLeaveRegisterPage() {
        this.setState({
            isShowingRegisterPage: false,
        });
    }

    handleFinishedSendingExternalPayload() {
        this.setState({
            savedRequest: undefined,
            savedEmail: undefined,
        });
    }

    render() {
        if(!this.state.isShowingRegisterPage) {
            return (
                <CodeSubmit className="Form"
                            onRegisterNecessary={this.handleGoToRegisterPage}
                            startWithPayload={this.state.savedRequest}
                            onFinishedSendingExternalPayload={
                                this.handleFinishedSendingExternalPayload
                            }

                />
            );
        } else {
            return (
                <RegisterPage onLeaveRegisterPage={this.handleLeaveRegisterPage}
                              savedEmail={this.state.savedEmail}
                />
            );
        }
    }
}

export default App;
