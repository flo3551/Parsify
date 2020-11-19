import React from "react";
import { Card } from "react-bootstrap";
import Moment from 'react-moment';

export class DomainDetails extends React.Component {
    render() {
        let domain = this.props.domain;
        let renderNoDomainSelected = <h1>Sélectionnez un domaine pour voir les détails</h1>
        if (!domain) {
            return (<h3>Sélectionnez un domaine pour voir les détails</h3>)
        }
        return (
            <>
                <Card>
                    <Card.Body>
                        <Card.Title>{domain?.domainName}</Card.Title>
                        {/*                         <Card.Subtitle className="mb-2 text-muted">Card Subtitle</Card.Subtitle>
     */}
                        <Card.Text>
                            Créé le <Moment date={domain?.dateRegistration} format="DD/MM/YYYY" />
                        </Card.Text>
                        {/* <Card.Link href="#">Card Link</Card.Link> */}
                    </Card.Body>
                </Card>
            </>
        )
    }
}