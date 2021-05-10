import React from 'react';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
    * {
        margin: 0;
    }
    #root {
        background-color: lightgreen;
        max-width: 1080px;
        margin: auto;
    }
`;

export default GlobalStyle;