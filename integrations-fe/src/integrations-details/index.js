// Export all integration configurations
import securityscorecard from './securityscorecard';
import axonius from './axonius';
import meraki from './meraki';
import ciscoDna from './cisco-dna';
import box from './box';
import egnyte from './egnyte';
import fmp from './fmp';

// Combine all integrations into a single object
const integrations = {
  securityscorecard,
  axonius,
  meraki,
  ciscoDna,
  box,
  egnyte,
  fmp
};

export default integrations;
