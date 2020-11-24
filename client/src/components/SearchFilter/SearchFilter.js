import debounce from 'lodash/debounce';
import React from "react";
import { Col, Container, Form, FormControl, InputGroup, Row } from "react-bootstrap";
import API from "../../utils/API";
import { DateFilter } from "../DateFilter/DateFilter";

export class SearchFilter extends React.Component {
    state = {
        domainsList: [],
        domainsCount: 0,
        keywordInput: null,
        exactDate: null,
        minDate: null,
        maxDate: null,
        nbResultsPerPage: 25,
        enableDateSearch: false
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
        let newDomainsList;
        let domainsCount;

        API.getFilteredDomains(this.state.nbResultsPerPage, this.state.exactDate, this.state.minDate, this.state.maxDate, this.state.keywordInput)
            .then((results) => {
                newDomainsList = results.data.domainsList;
                return API.getCountDomains(this.state.exactDate, this.state.minDate, this.state.maxDate, this.state.keywordInput)
            })
            .then((resultCount) => {
                domainsCount = resultCount.data.domainsCount;
                this.props.onDomainsSearch({ domainsList: newDomainsList, domainsCount: domainsCount });
            })
            .catch(error => {
                console.error(error);
                //TODO: handle
            })
    }

    handleChangeResultsPerPage = (event) => {
        this.setState({ nbResultsPerPage: event.target.value }, () => {
            this.props.onChangeNbResultsPerPage(event.target.value);
        })
    }

    handleEnableDateSearch = (event) => {
        this.setState({ enableDateSearch: event.target.checked });
    }

    render() {
        return (
            <Container className="border pt-2 pb-1 px-2" style={{ display: "block" }} >
                <Row>
                    <Col md={4} className="border-right">
                        <InputGroup>
                            <Row className="justify-content-md-center">
                                <Col md={12}>
                                    <p id="keyword-search-label">Recherche par mot-clé</p>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={12}>
                                    <FormControl size="sm"
                                        placeholder=""
                                        aria-label="Recherche par mot-clé"
                                        aria-describedby="keyword-search-label"
                                        onChange={this.onChangeKeywordInput}
                                    />
                                </Col>
                            </Row>
                        </InputGroup>
                    </Col>
                    <Col md={8}>
                        <InputGroup>
                            <Row className="justify-content-md-center">
                                <Col md={12}>
                                    <p id="date-search-label">
                                        <input
                                            name="enableDateSearch"
                                            type="checkbox"
                                            checked={this.state.enableDateSearch}
                                            onChange={this.handleEnableDateSearch}
                                            style={{ marginRight: "5px" }} />
                                        Recherche par date de création
                                        </p>
                                </Col>
                            </Row>
                            <Row>
                                <DateFilter onDateFiltersChange={this.handleDateFilterChange} enabled={this.state.enableDateSearch} />
                            </Row>
                        </InputGroup>
                    </Col>
                </Row>
                <Row className="mt-3 pt-3 border-top" >
                    <Col md={12} className="align-self-center">
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Form.Label className="text-muted" style={{ fontSize: "0.8rem", marginRight: "5px", display: "flex", alignItems: "center" }}>Nombre de résultats par page</Form.Label>
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