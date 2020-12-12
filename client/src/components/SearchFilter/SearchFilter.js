import debounce from 'lodash/debounce';
import React from "react";
import { Col, Container, Form, FormControl, FormLabel, InputGroup, Row } from "react-bootstrap";
import { DateFilter } from "../DateFilter/DateFilter";

export class SearchFilter extends React.Component {
    state = {
        zoneInput: -1,
        keywordInput: null,
        exactDate: null,
        minDate: null,
        maxDate: null,
        nbResultsPerPage: 25,
        enableDateSearch: false,
        isFavoriteChecked: false
    }

    handleDateFilterChange = (event) => {
        this.setState({ exactDate: event.exactDate, minDate: event.minDate, maxDate: event.maxDate }, this._updateParent);
    }

    onChangeKeywordInput = debounce((event) => {
        this.handleKeywordFilterChange(event);
    }, 750)

    handleKeywordFilterChange = (event) => {
        this.setState({ keywordInput: event.target.value }, this._updateParent)
    }

    _updateParent = () => {
        this.props.onFilterChange({
            keywordInput: this.state.keywordInput,
            exactDate: this.state.exactDate,
            minDate: this.state.minDate,
            maxDate: this.state.maxDate,
            zone: this.state.zoneInput,
            isFavoriteDomains: this.state.isFavoriteChecked
        })
    }

    handleChangeResultsPerPage = (event) => {
        this.setState({ nbResultsPerPage: event.target.value }, () => {
            this.props.onChangeNbResultsPerPage(event.target.value);
        })
    }

    handleZoneChange = (event) => {
        this.setState({ zoneInput: event.target.value }, this._updateParent)
    }

    handleEnableDateSearch = (event) => {
        let isChecked = event.target.checked
        if (isChecked) {
            this.setState({ enableDateSearch: event.target.checked }, this._updateParent);
        } else {
            this.setState({
                enableDateSearch: event.target.checked,
                exactDate: null,
                minDate: null,
                maxDate: null,
            }, this._updateParent);
        }
    }

    onCheckedFavorites = (event) => {
        let isChecked = event.target.checked;
        this.setState({
            zoneInput: -1,
            keywordInput: null,
            exactDate: null,
            minDate: null,
            maxDate: null,
            enableDateSearch: false,
            isFavoriteChecked: isChecked
        }, () => {
            this._updateParent();
        })
    }

    render() {
        return (
            <Container className="border pt-2 pb-1 px-2" style={{ display: "block" }} >
                <Row>
                    <Col md={12}>
                        <InputGroup>
                            <FormLabel id="keyword-search-label">Recherche par mot-clé</FormLabel>
                            <FormControl size="sm"
                                placeholder=""
                                aria-label="Recherche par mot-clé"
                                aria-describedby="keyword-search-label"
                                onChange={this.onChangeKeywordInput}
                            />
                        </InputGroup>
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        <FormControl as="select" size="xm" custom value={this.state.zoneInput} onChange={this.handleZoneChange}>
                            <option value={-1} key={-1}> &#x1F5FA;&#xFE0F; Toutes les zones</option>
                            <option value="inter">&#x1F30D; International</option>
                            <option value="fr">&#x1F950;  France</option>
                        </FormControl>
                    </Col>
                </Row>
                <Row >
                    <Col md={12} className="align-self-center">
                        <InputGroup>
                            <input
                                name="enableDateSearch"
                                type="checkbox"
                                checked={this.state.enableDateSearch}
                                onChange={this.handleEnableDateSearch}
                                style={{ marginRight: "5px" }} />
                                Recherche par date de création
                            <DateFilter onDateFiltersChange={this.handleDateFilterChange} enabled={this.state.enableDateSearch} />
                        </InputGroup>
                    </Col>
                </Row>
                <Row>
                    <Col md={7} className="align-self-center">
                        <Form.Group>
                            <Form.Check type="checkbox" label="Afficher mes domaines favoris" checked={this.state.isFavoriteChecked} onChange={this.onCheckedFavorites} />
                        </Form.Group>
                    </Col>
                    <Col md={5} className="align-self-center">
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Form.Label className="text-muted" style={{ fontSize: "0.8rem", marginRight: "5px", display: "flex", alignItems: "center" }}>Résultats</Form.Label>
                            <FormControl as="select" size="xm" custom style={{ width: "65px", fontSize: "0.8rem" }} onChange={this.handleChangeResultsPerPage}>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </FormControl>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}