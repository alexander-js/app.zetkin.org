import { Box } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import TabbedLayout from 'utils/layout/TabbedLayout';
import { useState } from 'react';

import EventDataModel from '../models/EventDataModel';
import EventStatusChip from '../components/EventStatusChip';
import EventTypeAutocomplete from '../components/EventTypeAutocomplete';
import EventTypesModel from '../models/EventTypesModel';
import messageIds from '../l10n/messageIds';
import useModel from 'core/useModel';
import ZUIEditTextinPlace from 'zui/ZUIEditTextInPlace';
import ZUIFuture from 'zui/ZUIFuture';
import ZUIFutures from 'zui/ZUIFutures';
import { ZUIIconLabelProps } from 'zui/ZUIIconLabel';
import ZUIIconLabelRow from 'zui/ZUIIconLabelRow';
import ZUITimeSpan from 'zui/ZUITimeSpan';
import { Msg, useMessages } from 'core/i18n';

interface EventLayoutProps {
  children: React.ReactNode;
  eventId: string;
  orgId: string;
  campaignId: string;
}

const EventLayout: React.FC<EventLayoutProps> = ({
  children,
  eventId,
  orgId,
  campaignId,
}) => {
  const [editingTypeOrTitle, setEditingTypeOrTitle] = useState(false);

  const messages = useMessages(messageIds);

  const model = useModel(
    (env) => new EventDataModel(env, parseInt(orgId), parseInt(eventId))
  );

  const typesModel = useModel(
    (env) => new EventTypesModel(env, parseInt(orgId))
  );

  return (
    <TabbedLayout
      baseHref={`/organize/${orgId}/projects/${campaignId}/events/${eventId}`}
      defaultTab="/"
      subtitle={
        <Box alignItems="center" display="flex">
          <Box marginRight={1}>
            <EventStatusChip state={model.state} />
          </Box>
          <ZUIFutures
            futures={{
              currentEvent: model.getData(),
              types: typesModel.getTypes(),
            }}
          >
            {({ data: { types, currentEvent } }) => {
              return (
                <EventTypeAutocomplete
                  onBlur={() => setEditingTypeOrTitle(false)}
                  onChange={(newValue) => {
                    if (newValue) {
                      // TODO: Pass null values as well, when API supports it
                      model.setType(newValue.id);
                    }
                    setEditingTypeOrTitle(false);
                  }}
                  onChangeNewOption={(newValueId) => model.setType(newValueId)}
                  onFocus={() => setEditingTypeOrTitle(true)}
                  showBorder={editingTypeOrTitle}
                  types={types}
                  typesModel={typesModel}
                  value={currentEvent.activity}
                />
              );
            }}
          </ZUIFutures>
          <Box marginX={1}>
            <ZUIFuture future={model.getData()}>
              {(data) => {
                const startDate = new Date(data.start_time);

                const endDate = new Date(data.end_time);

                const labels: ZUIIconLabelProps[] = [];

                if (startDate && endDate) {
                  labels.push({
                    icon: <EventIcon />,
                    label: <ZUITimeSpan end={endDate} start={startDate} />,
                  });
                  if (data.num_participants_available) {
                    labels.push({
                      icon: <PeopleIcon />,
                      label: (
                        <Msg
                          id={messageIds.stats.participants}
                          values={{
                            participants: data.num_participants_available,
                          }}
                        />
                      ),
                    });
                  }
                }
                return <ZUIIconLabelRow iconLabels={labels} />;
              }}
            </ZUIFuture>
          </Box>
        </Box>
      }
      tabs={[
        { href: '/', label: messages.tabs.overview() },
        {
          href: '/participants',
          label: messages.tabs.participants(),
        },
      ]}
      title={
        <ZUIFuture future={model.getData()}>
          {(data) => {
            return (
              <ZUIEditTextinPlace
                allowEmpty={true}
                onBlur={() => {
                  setEditingTypeOrTitle(false);
                }}
                onChange={(val) => {
                  setEditingTypeOrTitle(false);
                  model.setTitle(val);
                }}
                onFocus={() => setEditingTypeOrTitle(true)}
                placeholder={
                  data.title || data.activity.title || messages.type.untitled()
                }
                showBorder={editingTypeOrTitle}
                tooltipContent={messages.tooltipContent()}
                value={data.title || ''}
              />
            );
          }}
        </ZUIFuture>
      }
    >
      {children}
    </TabbedLayout>
  );
};

export default EventLayout;
