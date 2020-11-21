import React from "react";
import { Image } from "react-bootstrap";
import API from "../../utils/API";

export class DomainScreenshot extends React.Component {
    state = {
        domainScreenshot: null,
        hasScreenshodFinished: false
    }

    componentDidMount() {
        this._getScreenShot();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.domainName !== this.props.domainName) {
            this._getScreenShot();
        }
    }
    _getScreenShot = () => {
        this.setState({ domainScreenshot: null, hasScreenshodFinished: false })
        API.getDomainScreenshot(this.props.domainName)
            .then((results) => {
                if (results.data.domainName === this.props.domainName) {
                    this.setState({ domainScreenshot: results.data.b64screenshot, hasScreenshodFinished: true })
                }
            })
            .catch(error => {
                this.setState({ hasScreenshodFinished: true })
                console.error(error);
            })
    }

    _renderScreenshot = () => {
        let render;
        if (this.state.domainScreenshot) {
            render = <Image src={`data:image/png;base64,${this.state.domainScreenshot}`} style={{ width: "80%" }}></Image>
        } else if (!this.state.hasScreenshodFinished) {
            render = <h5>Screenshot en cours de chargement...</h5>
        } else {
            render = <h5>Aucun screenshot disponible.</h5>
        }

        return render;
    }

    render() {
        let render = this._renderScreenshot();
        return (
            <>
                {render}
            </>
        )
    }
}