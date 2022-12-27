import { SXSReader } from './SXSReader.js';

export function parseSXSInclude(node, sxsReader) {
    let filename = sxsReader.reader.getString(node, 'filename', false);
    if (filename == null)
        return sxsReader.onXMLError('no filename defined for include');

    let helperReader = new SXSReader(sxsReader.graph, filename, false);
    sxsReader.graph.helperReaders.push(helperReader);
    helperReader.reader.open();
}
