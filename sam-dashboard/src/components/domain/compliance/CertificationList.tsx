/**
 * CertificationList - List of certifications with grid layout
 */

import { Text, FileCheckIcon } from '../../primitives';
import { Grid, GridItem, Flex, Card, CardBody } from '../../layout';
import { CertificationCard } from './CertificationCard';
import type { CertificationListProps } from './Compliance.types';

export function CertificationList({
  certifications,
  onEdit,
  onDelete,
  onViewDetails,
  isLoading = false,
  emptyMessage = 'No certifications found',
}: CertificationListProps): React.ReactElement {
  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '200px' }}>
        <Text variant="body" color="muted">
          Loading certifications...
        </Text>
      </Flex>
    );
  }

  if (certifications.length === 0) {
    return (
      <Card variant="outlined">
        <CardBody>
          <Flex
            direction="column"
            align="center"
            gap="md"
            className="p-8"
          >
            <FileCheckIcon size="xl" color="muted" />
            <Text variant="body" color="muted" style={{ textAlign: 'center' }}>
              {emptyMessage}
            </Text>
          </Flex>
        </CardBody>
      </Card>
    );
  }

  return (
    <Grid columns="repeat(auto-fill, minmax(380px, 1fr))" gap="md">
      {certifications.map((certification) => (
        <GridItem key={certification.id}>
          <CertificationCard
            certification={certification}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
          />
        </GridItem>
      ))}
    </Grid>
  );
}

export default CertificationList;
