import type {Organization} from '../../../types/crm';

export interface OrganizationCardProps {
  organization: Organization;
  onEdit?: (organization: Organization) => void;
  onDelete?: (organization: Organization) => void;
  onClick?: (organization: Organization) => void;
  showActions?: boolean;
}
