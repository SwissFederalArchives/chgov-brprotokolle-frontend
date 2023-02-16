import { useState } from "react";
import * as DOMPurify from "dompurify";

const DEFAULT_OPTIONS = {
    html: true,
    breaks: true,
    linkify: true,
};

DOMPurify.addHook('afterSanitizeAttributes', function (node: any) {
    // set all elements owning target to target=_blank
    if ('target' in node) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener');
    }
});

const MarkdownFileToHTML = ({ children, options, domPurifyOptions= {} }: { children: string, options?: object, domPurifyOptions?: object }) => {
    const mdOptions = { ...DEFAULT_OPTIONS, ...options };
    const md = require('markdown-it')(mdOptions)
        .use(require('markdown-it-attrs'))

    const [markdown, setMarkdown] = useState<string | null>(null);
    fetch(children)
        .then(response => response.text())
        .then(text => {
            const html = md.render(text);
            if (html) {
                setMarkdown(html);
            }
        });


    return markdown ? <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(markdown, domPurifyOptions) }} /> : null;
};

export default MarkdownFileToHTML;