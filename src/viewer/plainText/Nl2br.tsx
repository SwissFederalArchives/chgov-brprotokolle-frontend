import * as React from 'react';
import UrlValidation from '../../lib/UrlValidation';
import he from 'he';

interface IProps {
    text: string;
    urlTransformation?: boolean;
}

export default function Nl2br(props: IProps) {
    const escapeText = (text: string) => he.encode(text);

    return <>{props.text.split('\n').map(function(item: string, i: number) {
        if (props.urlTransformation === true && UrlValidation.isURL(item)) {
            const escapedItem = escapeText(item);
            return <span key={i}><a href={escapedItem} target="_blank" rel="noopener noreferrer">{escapedItem}</a><br /></span>;
        }

        return <span key={i} style={{whiteSpace: 'pre'}}>{item}<br /></span>;
    })}</>;
}
