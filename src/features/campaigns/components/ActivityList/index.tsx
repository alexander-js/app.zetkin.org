import { FilterListOutlined } from '@mui/icons-material';
import Fuse from 'fuse.js';
import { useMemo } from 'react';
import { Box, Card, Divider, Typography } from '@mui/material';

import CallAssignmentListItem from './items/CallAssignmentListItem';
import EventListItem from './items/EventListItem';
import messageIds from 'features/campaigns/l10n/messageIds';
import SurveyListItem from './items/SurveyListItem';
import TaskListItem from './items/TaskListItem';
import { useMessages } from 'core/i18n';
import {
  ACTIVITIES,
  CampaignActivity,
} from 'features/campaigns/models/CampaignActivitiesModel';

interface ActivitiesProps {
  activities: CampaignActivity[];
  orgId: number;
}

const Activities = ({ activities, orgId }: ActivitiesProps) => {
  return (
    <Card>
      {activities.map((activity, index) => {
        if (activity.kind === ACTIVITIES.CALL_ASSIGNMENT) {
          return (
            <Box key={`ca-${activity.data.id}`}>
              {index > 0 && <Divider />}
              <CallAssignmentListItem caId={activity.data.id} orgId={orgId} />
            </Box>
          );
        } else if (activity.kind === ACTIVITIES.EVENT) {
          return (
            <Box key={`event-${activity.data.id}`}>
              {index > 0 && <Divider />}
              <EventListItem eventId={activity.data.id} orgId={orgId} />
            </Box>
          );
        } else if (activity.kind === ACTIVITIES.SURVEY) {
          return (
            <Box key={`survey-${activity.data.id}`}>
              {index > 0 && <Divider />}
              <SurveyListItem orgId={orgId} surveyId={activity.data.id} />
            </Box>
          );
        } else if (activity.kind === ACTIVITIES.TASK) {
          return (
            <Box key={`task-${activity.data.id}`}>
              {index > 0 && <Divider />}
              <TaskListItem orgId={orgId} taskId={activity.data.id} />
            </Box>
          );
        }
      })}
    </Card>
  );
};

interface ActivityListProps {
  allActivities: CampaignActivity[];
  filters: ACTIVITIES[];
  orgId: number;
  searchString: string;
}

const ActivityList = ({
  allActivities,
  filters,
  orgId,
  searchString,
}: ActivityListProps) => {
  const messages = useMessages(messageIds);

  const searchResults = useMemo(() => {
    const filteredActivities = allActivities.filter((activity) =>
      filters.includes(activity.kind)
    );

    const fuse = new Fuse(filteredActivities, {
      keys: ['title'],
      threshold: 0.4,
    });

    return searchString
      ? fuse.search(searchString).map((fuseResult) => fuseResult.item)
      : filteredActivities;
  }, [searchString, filters, allActivities]);

  return (
    <>
      {searchResults.length > 0 && (
        <Activities activities={searchResults} orgId={orgId} />
      )}
      {!searchResults.length && (
        <Box alignItems="center" display="flex" flexDirection="column">
          <FilterListOutlined color="secondary" sx={{ fontSize: '12em' }} />
          <Typography color="secondary">
            {messages.singleProject.noSearchResults()}
          </Typography>
        </Box>
      )}
    </>
  );
};

export default ActivityList;
