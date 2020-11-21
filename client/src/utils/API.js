import axios from "axios";
const headers = {
    "Content-Type": "application/json"
};
// const burl = "http://localhost:3000";
const burl = "http://51.77.149.226:3001";

export default {
    login: function (email, password) {
        return axios.post(
            `${burl}/login`,
            {
                email,
                password
            },
            {
                headers: headers
            }
        );
    },
    signup: function (email, password) {
        return axios.post(`${burl}/signup`, { email, password }, { headers: headers, });
    },

    isAuth: function () {
        return localStorage.getItem("token") !== null;
    },
    logout: function () {
        localStorage.clear();
    },
    getDomainsList: function () {
        return axios.get(`${burl}/getDomainsList`, { headers: headers });
    },
    getDomainsForPage: function (page, nbResultsPerPage) {
        return axios.get(`${burl}/getDomainsForPage`, { params: { page: page.toString(), nbResultsPerPage: nbResultsPerPage.toString() }, headers: headers });
    },
    getCountDomains: function () {
        return axios.get(`${burl}/getDomainsCount`, { headers: headers });
    }
};