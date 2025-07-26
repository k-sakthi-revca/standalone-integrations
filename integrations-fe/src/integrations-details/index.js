// Export all integration configurations
import securityscorecard from './securityscorecard';
import axonius from './axonius';
import meraki from './meraki';
import ciscoDna from './cisco-dna';

// Combine all integrations into a single object
const integrations = {
  securityscorecard,
  axonius,
  meraki,
  ciscoDna
};

export default integrations;
