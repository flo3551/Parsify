import React from "react";
import { Card, Button } from "react-bootstrap";
import Moment from 'react-moment';
import { DomainScreenshot } from '../DomainScreenshot/DomainScreenshot';
import { IconsSVG } from "../SVG/IconsSVG";
import API from "../../utils/API";

export class DomainDetails extends React.Component {
    state = {
        isFavorite: false
    }

    componentDidMount() {
        if (this.props.domain) {
            this._isDomainFavorited();
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.domain || prevProps.domain.domainName !== this.props.domain.domainName)
            this.setState({ isFavorite: false }, () => {

                this._isDomainFavorited();
            })
    }

    _isDomainFavorited = () => {
        let login = localStorage.getItem("emailLogin");

        API.isDomainFavorited(login, this.props.domain.domainName)
            .then((response) => {
                if (response.data.isFavorited) {
                    this.setState({ isFavorite: response.data.isFavorited })
                }
                console.log("response", response);
            })
            .catch(error => {
                console.log("error", error);
            })
    }

    onClickFavoriteButton = () => {
        let login = localStorage.getItem("emailLogin");
        if (this.state.isFavorite === false) {
            this.setState({ isFavorite: true }, () => {
                API.addFavoriteDomain(login, this.props.domain.domainName)
                    .catch((error) => {
                        this.setState({ isFavorite: false })
                    });
            })
        } else {
            this.setState({ isFavorite: false }, () => {
                API.deleteFavoriteDomain(login, this.props.domain.domainName)
                    .catch(error => {
                        this.setState({ isFavorite: true })
                    })
            })
        }
    }

    _renderFavoriteIcon() {
        let icon = "star-outline";
        if (this.state.isFavorite) {
            icon = "star-filled";
        }

        return (
            <IconsSVG size={20} icon={icon} />
        )
    }

    render() {
        let domain = this.props.domain;
        if (!domain) {
            return (<h3>Sélectionnez un domaine pour voir les détails</h3>)
        }
        return (
            <Card style={{ position: "-webkit-sticky", position: "sticky", top: "20%" }} >
                <Card.Body>
                    <Card.Title>
                        <span>
                            {domain?.domainName}
                        </span>
                        <span className="favorite-logo float-right">
                            <Button variant="outline-warning" style={{ display: "flex" }} onClick={this.onClickFavoriteButton}>
                                {this._renderFavoriteIcon()}
                            </Button>
                        </span>
                    </Card.Title>
                    <Card.Text>
                        Créé le <Moment date={domain?.dateRegistration} format="DD/MM/YYYY" />
                    </Card.Text>
                    <DomainScreenshot domainName={domain?.domainName} />
                </Card.Body>
            </Card>
        )
    }
}