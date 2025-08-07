
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Team } from '@/lib/types';

interface TeamCardProps {
  team: Team;
  children: React.ReactNode;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, children }) => {
  return (
    <Card style={{ borderLeft: `5px solid ${team.color}` }}>
      <CardHeader>
        <CardTitle>{team.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default TeamCard;
