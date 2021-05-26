import React from 'react';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
    * {
        margin: 0;
    }
    #root {
        background-color: lightgreen;
        max-width: 1080px;
        margin: 10px auto;
    }
    .stops > a {
        margin: 5px;
        background: lightblue;
        color: black;
        text-decoration: none;
        padding: 5px;
        font-size: 1.5rem;
    }
`;

export default GlobalStyle;