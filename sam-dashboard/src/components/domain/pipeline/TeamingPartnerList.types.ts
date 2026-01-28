import type {TeamingPartner} from '../../../types/pipeline';

export interface TeamingPartnerListProps {
  partners: TeamingPartner[];
  teamingPartnersString?: string;
  onAdd?: () => void;
  onEdit?: (partner: TeamingPartner) => void;
  onRemove?: (partner: TeamingPartner) => void;
  isLoading?: boolean;
}
