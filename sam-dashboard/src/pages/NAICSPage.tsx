import {useMemo} from 'react';
import {TagIcon} from '../components/catalyst/primitives';
import {Section, SectionHeader} from '../components/catalyst/layout';
import {getNAICSDescription, OpportunityList} from '../components/domain';
import {NAICSPageProps} from './Pages.types';

export function NAICSPage({naicsCode, opportunities}: NAICSPageProps) {
    // Ensure opportunities is an array (defensive check)
    const safeOpportunities = opportunities ?? [];

    const filteredOpportunities = useMemo(() => {
        return safeOpportunities.filter((o) => o.naicsCode === naicsCode);
    }, [safeOpportunities, naicsCode]);

    const description = getNAICSDescription(naicsCode);

    return (
        <Section id={`naics-${naicsCode}`}>
            <SectionHeader
                title={`NAICS ${naicsCode}: ${description}`}
                icon={<TagIcon size="lg"/>}
            />
            <OpportunityList
                opportunities={filteredOpportunities}
                emptyMessage={`No opportunities found for NAICS ${naicsCode}.`}
            />
        </Section>
    );
}

export default NAICSPage;
