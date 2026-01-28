import {useMemo, useState} from 'react';
import {Badge, Button, CheckCircleIcon, Text} from '../components/catalyst/primitives';
import {Card, CardBody, CardHeader, HStack, Section, SectionHeader,} from '../components/catalyst/layout';
import {getSbirPhaseLabel, isSbirOpportunity, OpportunityList, StatCard, StatsGrid,} from '../components/domain';
import {SBIRPageProps} from './Pages.types';

type PhaseFilter = 'all' | 'I' | 'II' | 'III';

export function SBIRPage({opportunities}: SBIRPageProps) {
    const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('all');

    const sbirOpportunities = useMemo(() => {
        return opportunities.filter(isSbirOpportunity);
    }, [opportunities]);

    const filteredOpportunities = useMemo(() => {
        if (phaseFilter === 'all') return sbirOpportunities;
        return sbirOpportunities.filter((o) => o.sbirPhase === phaseFilter);
    }, [sbirOpportunities, phaseFilter]);

    const stats = useMemo(() => {
        const sbir = sbirOpportunities.filter((o) => o.isSbir === true).length;
        const sttr = sbirOpportunities.filter((o) => o.isSttr === true).length;
        const phaseI = sbirOpportunities.filter((o) => o.sbirPhase === 'I').length;
        const phaseII = sbirOpportunities.filter((o) => o.sbirPhase === 'II').length;
        const phaseIII = sbirOpportunities.filter((o) => o.sbirPhase === 'III').length;

        return {total: sbirOpportunities.length, sbir, sttr, phaseI, phaseII, phaseIII};
    }, [sbirOpportunities]);

    return (
        <Section id="sbir">
            <SectionHeader title="SBIR / STTR Opportunities" icon={<CheckCircleIcon size="lg"/>}/>

            <StatsGrid columns={6}>
                <StatCard value={stats.total} label="Total SBIR/STTR"/>
                <StatCard value={stats.sbir} label="SBIR"/>
                <StatCard value={stats.sttr} label="STTR"/>
                <StatCard value={stats.phaseI} label="Phase I"/>
                <StatCard value={stats.phaseII} label="Phase II"/>
                <StatCard value={stats.phaseIII} label="Phase III"/>
            </StatsGrid>

            <Card>
                <CardHeader>
                    <HStack justify="between" align="center">
                        <Text variant="heading5">Filter by Phase</Text>
                        <HStack spacing="sm">
                            <Button
                                variant={phaseFilter === 'all' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setPhaseFilter('all')}
                            >
                                All
                            </Button>
                            <Button
                                variant={phaseFilter === 'I' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setPhaseFilter('I')}
                            >
                                Phase I
                            </Button>
                            <Button
                                variant={phaseFilter === 'II' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setPhaseFilter('II')}
                            >
                                Phase II
                            </Button>
                            <Button
                                variant={phaseFilter === 'III' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setPhaseFilter('III')}
                            >
                                Phase III
                            </Button>
                        </HStack>
                    </HStack>
                </CardHeader>
                <CardBody padding="none">
                    <OpportunityList
                        opportunities={filteredOpportunities}
                        emptyMessage="No SBIR/STTR opportunities found."
                        renderBadge={(opp) => (
                            <HStack spacing="sm">
                                {opp.isSbir === true && <Badge color="cyan">SBIR</Badge>}
                                {opp.isSttr === true && <Badge color="green">STTR</Badge>}
                                {opp.sbirPhase !== null && opp.sbirPhase !== undefined && (
                                    <Badge color="amber">
                                        {getSbirPhaseLabel(opp.sbirPhase)}
                                    </Badge>
                                )}
                            </HStack>
                        )}
                    />
                </CardBody>
            </Card>
        </Section>
    );
}

export default SBIRPage;
