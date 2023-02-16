import i18n from 'i18next';
import Main from "../main/main";
import MarkdownFileToHtml from '../markdownFileToHtml/markdownFileToHtml';
import { Translation } from 'react-i18next';

export default function PageInformation() {
    return (
        <Translation ns="common">
            {(t) => (
                <Main>
                    <MarkdownFileToHtml>{`/md/${i18n.language}/information.md`}</MarkdownFileToHtml>
                </Main>
            )}
        </Translation>
    );
}
