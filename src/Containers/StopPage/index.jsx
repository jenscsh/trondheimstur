import React, { useEffect, useState } from 'react';
import Cosmic from 'cosmicjs';
import Plot from 'react-plotly.js';
import Mapbox from 'mapbox-gl';

function StopPage({ match }) {
    const [pageData, setPageData] = useState(null);

    //Henter overskrift og artikkeldata fra Cosmic
    useEffect(() => {
        const client = new Cosmic();
        const bucket = client.bucket({
            slug: process.env.COSMIC_BUCKET_SLUG,
            read_key: process.env.COSMIC_READKEY
        });
        bucket.getObject({
            slug: match.params.slug,
            props: 'title,content,metafields'
        }).then(data => {
            setPageData(data.object);
        })
            .catch(error => {
                console.error(error);
            });
    }, []);

    function renderPage() {
        return (
            <main>
                <h1>{pageData.title}</h1>
                <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
            </main>
        )
    }

    return (
        <>
            {(pageData === null) ? (<p>Henter innhold...</p>) : renderPage()}
        </>
    )
}

export default StopPage;