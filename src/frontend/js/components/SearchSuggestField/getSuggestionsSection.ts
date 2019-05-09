import take from 'lodash-es/take';
import { stringify } from 'query-string';
import { FormattedMessage } from 'react-intl';

import { API_ENDPOINTS } from '../../settings';
import { modelName } from '../../types/models';
import { Suggestion } from '../../types/Suggestion';
import { handle } from '../../utils/errors/handle';

/**
 * Build a suggestion section from a model name and a title, requesting the relevant
 * values to populate it from the API
 * @param kind The kind of suggestion we're issuing the completion request for. Determines the API
 * endpoint we're sending the request to.
 * @param sectionTitleMessage MessageDescriptor for the title of the section that displays the suggestions.
 * @param query The actual payload to run the completion search with.
 */
export const getSuggestionsSection = async <Kind extends modelName>(
  kind: Kind,
  sectionTitleMessage: FormattedMessage.MessageDescriptor,
  query: string,
) => {
  // Run the search for the section on the API
  let response: Response;
  try {
    response = await fetch(
      `${API_ENDPOINTS.autocomplete[kind]}?${stringify({ query })}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    return handle(new Error(error));
  }

  // Fetch treats remote errors (400, 404, 503...) as successes
  // The ok flag is the way to discriminate
  if (!response.ok) {
    return handle(
      new Error(
        `Failed to get list from ${API_ENDPOINTS.autocomplete[kind]} : ${
          response.status
        }`,
      ),
    );
  }

  let responseData: Array<Suggestion<Kind>['data']>;
  try {
    responseData = await response.json();
  } catch (error) {
    return handle(
      new Error('Failed to decode JSON in getSuggestionSection ' + error),
    );
  }

  return {
    kind,
    message: sectionTitleMessage,
    values: take(responseData, 3).map(data => ({ data, kind })),
  };
};