// Export all integration configurations
import securityscorecard from './securityscorecard';
import axonius from './axonius';
import meraki from './meraki';
import ciscoDna from './cisco-dna';
import box from './box';
import egnyte from './egnyte';
import fmp from './fmp';
import salesforce from './salesforce';
import office365 from './office365';
import solarwinds from './solarwinds';
import cribl from './cribl';
import gdrive from './gdrive';
import dropbox from './dropbox';
import quickbooks from './quickbooks';

// Combine all integrations into a single object
const integrations = {
  securityscorecard,
  axonius,
  meraki,
  ciscoDna,
  box,
  egnyte,
  fmp,
  salesforce,
  office365,
  solarwinds,
  cribl,
  gdrive,
  dropbox,
  quickbooks
};

export default integrations;
