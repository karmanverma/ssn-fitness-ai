# Live API - WebSockets API Reference

The Live API is a stateful API that uses WebSockets[1]. This section provides additional details regarding the WebSockets API for the Gemini API.

## Sessions

A WebSocket connection establishes a session between the client and the Gemini server[1]. After a client initiates a new connection, the session can exchange messages with the server to:

- Send text, audio, or video to the Gemini server
- Receive audio, text, or function call requests from the Gemini server

### WebSocket Connection

To start a session, connect to this WebSocket endpoint[1]:

```
wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent
```

### Session Configuration

The initial message after connection sets the session configuration, which includes the model, generation parameters, system instructions, and tools[1].

You can change the configuration parameters except the model during the session[1].

See the following example configuration[1]:

```json
{
  "model": "string",
  "generationConfig": {
    "candidateCount": "integer",
    "maxOutputTokens": "integer",
    "temperature": "number",
    "topP": "number",
    "topK": "integer",
    "presencePenalty": "number",
    "frequencyPenalty": "number",
    "responseModalities": ["string"],
    "speechConfig": "object",
    "mediaResolution": "object"
  },
  "systemInstruction": "string",
  "tools": ["object"]
}
```

## Send Messages

To exchange messages over the WebSocket connection, the client must send a JSON object over an open WebSocket connection[1]. The JSON object must have **exactly one** of the fields from the following object set:

```json
{
  "setup": "BidiGenerateContentSetup",
  "clientContent": "BidiGenerateContentClientContent",
  "realtimeInput": "BidiGenerateContentRealtimeInput",
  "toolResponse": "BidiGenerateContentToolResponse"
}
```

### Supported Client Messages

| Message | Description |
|---------|-------------|
| `BidiGenerateContentSetup` | Session configuration to be sent in the first message[1] |
| `BidiGenerateContentClientContent` | Incremental content update of the current conversation delivered from the client[1] |
| `BidiGenerateContentRealtimeInput` | Real time audio, video, or text input[1] |
| `BidiGenerateContentToolResponse` | Response to a `ToolCallMessage` received from the server[1] |

## Receive Messages

To receive messages from Gemini, listen for the WebSocket 'message' event, and then parse the result according to the definition of the supported server messages[1].

Example usage[1]:

```python
async with client.aio.live.connect(model='...', config=config) as session:
    await session.send(input='Hello world!', end_of_turn=True)
    async for message in session.receive():
        print(message)
```

Server messages may have a `usageMetadata` field but will otherwise include **exactly one** of the other fields from the `BidiGenerateContentServerMessage` message[1].

## Messages and Events

### ActivityEnd

This type has no fields[1].

Marks the end of user activity[1].

### ActivityHandling

The different ways of handling user activity[1].

| Enum | Description |
|------|-------------|
| `ACTIVITY_HANDLING_UNSPECIFIED` | If unspecified, the default behavior is `START_OF_ACTIVITY_INTERRUPTS`[1] |
| `START_OF_ACTIVITY_INTERRUPTS` | If true, start of activity will interrupt the model's response (also called "barge in"). The model's current response will be cut-off in the moment of the interruption. This is the default behavior[1] |
| `NO_INTERRUPTION` | The model's response will not be interrupted[1] |

### ActivityStart

This type has no fields[1].

Marks the start of user activity[1].

### AudioTranscriptionConfig

This type has no fields[1].

The audio transcription configuration[1].

### AutomaticActivityDetection

Configures automatic detection of activity[1].

| Field | Description |
|-------|-------------|
| `disabled` | Optional. If enabled (the default), detected voice and text input count as activity. If disabled, the client must send activity signals[1] |
| `startOfSpeechSensitivity` | Optional. Determines how likely speech is to be detected[1] |
| `prefixPaddingMs` | Optional. The required duration of detected speech before start-of-speech is committed. The lower this value, the more sensitive the start-of-speech detection is and shorter speech can be recognized. However, this also increases the probability of false positives[1] |
| `endOfSpeechSensitivity` | Optional. Determines how likely detected speech is ended[1] |
| `silenceDurationMs` | Optional. The required duration of detected non-speech (e.g. silence) before end-of-speech is committed. The larger this value, the longer speech gaps can be without interrupting the user's activity but this will increase the model's latency[1] |

### BidiGenerateContentClientContent

Incremental update of the current conversation delivered from the client[1]. All of the content here is unconditionally appended to the conversation history and used as part of the prompt to the model to generate content.

A message here will interrupt any current model generation[1].

| Field | Description |
|-------|-------------|
| `turns[]` | Optional. The content appended to the current conversation with the model. For single-turn queries, this is a single instance. For multi-turn queries, this is a repeated field that contains conversation history and the latest request[1] |
| `turnComplete` | Optional. If true, indicates that the server content generation should start with the currently accumulated prompt. Otherwise, the server awaits additional messages before starting generation[1] |

### BidiGenerateContentRealtimeInput

User input that is sent in real time[1].

The different modalities (audio, video and text) are handled as concurrent streams. The ordering across these streams is not guaranteed[1].

This is different from `BidiGenerateContentClientContent` in a few ways[1]:

- Can be sent continuously without interruption to model generation
- If there is a need to mix data interleaved across the `BidiGenerateContentClientContent` and the `BidiGenerateContentRealtimeInput`, the server attempts to optimize for best response, but there are no guarantees
- End of turn is not explicitly specified, but is rather derived from user activity (for example, end of speech)
- Even before the end of turn, the data is processed incrementally to optimize for a fast start of the response from the model

| Field | Description |
|-------|-------------|
| `mediaChunks[]` | Optional. Inlined bytes data for media input. Multiple DEPRECATED: Use one of[1] |
| `audio` | Optional. These form the realtime audio input stream[1] |
| `video` | Optional. These form the realtime video input stream[1] |
| `activityStart` | Optional. Marks the start of user activity. This can only be sent if automatic (i.e. server-side) activity detection is disabled[1] |
| `activityEnd` | Optional. Marks the end of user activity. This can only be sent if automatic (i.e. server-side) activity detection is disabled[1] |
| `audioStreamEnd` | Optional. Indicates that the audio stream has ended, e.g. because the microphone was turned off. This should only be sent when automatic activity detection is enabled (which is the default). The client can reopen the stream by sending an audio message[1] |
| `text` | Optional. These form the realtime text input stream[1] |

### BidiGenerateContentServerContent

Incremental server update generated by the model in response to client messages[1].

Content is generated as quickly as possible, and not in real time. Clients may choose to buffer and play it out in real time[1].

| Field | Description |
|-------|-------------|
| `generationComplete` | Output only. If true, indicates that the model is done generating. When model is interrupted while generating there will be no 'generation_complete' message in interrupted turn, it will go through 'interrupted > turn_complete'. When model assumes realtime playback there will be delay between generation_complete and turn_complete that is caused by model waiting for playback to finish[1] |
| `turnComplete` | Output only. If true, indicates that the model has completed its turn. Generation will only start in response to additional client messages[1] |
| `interrupted` | Output only. If true, indicates that a client message has interrupted current model generation. If the client is playing out the content in real time, this is a good signal to stop and empty the current playback queue[1] |
| `groundingMetadata` | Output only. Grounding metadata for the generated content[1] |
| `inputTranscription` | Output only. Input audio transcription. The transcription is sent independently of the other server messages and there is no guaranteed ordering[1] |
| `outputTranscription` | Output only. Output audio transcription. The transcription is sent independently of the other server messages and there is no guaranteed ordering, in particular not between[1] |
| `urlContextMetadata` | [1] |
| `modelTurn` | Output only. The content that the model has generated as part of the current conversation with the user[1] |

### BidiGenerateContentServerMessage

Response message for the BidiGenerateContent call[1].

| Field | Description |
|-------|-------------|
| `usageMetadata` | Output only. Usage metadata about the response(s)[1] |
| Union field `messageType` | The type of the message. `messageType` can be only one of the following[1] |
| `setupComplete` | Output only. Sent in response to a[1] |
| `serverContent` | Output only. Content generated by the model in response to client messages[1] |
| `toolCall` | Output only. Request for the client to execute the[1] |
| `toolCallCancellation` | Output only. Notification for the client that a previously issued[1] |
| `goAway` | Output only. A notice that the server will soon disconnect[1] |
| `sessionResumptionUpdate` | Output only. Update of the session resumption state[1] |

### BidiGenerateContentSetup

Message to be sent in the first (and only in the first) `BidiGenerateContentClientMessage`[1]. Contains configuration that will apply for the duration of the streaming RPC.

Clients should wait for a `BidiGenerateContentSetupComplete` message before sending any additional messages[1].

| Field | Description |
|-------|-------------|
| `model` | Required. The model's resource name. This serves as an ID for the Model to use. Format[1] |
| `generationConfig` | Optional. Generation config. The following fields are not supported[1] |
| `systemInstruction` | Optional. The user provided system instructions for the model. Note: Only text should be used in parts and content in each part will be in a separate paragraph[1] |
| `tools[]` | Optional. A list of A[1] |
| `realtimeInputConfig` | Optional. Configures the handling of realtime input[1] |
| `sessionResumption` | Optional. Configures session resumption mechanism. If included, the server will send[1] |
| `contextWindowCompression` | Optional. Configures a context window compression mechanism. If included, the server will automatically reduce the size of the context when it exceeds the configured length[1] |
| `inputAudioTranscription` | Optional. If set, enables transcription of voice input. The transcription aligns with the input audio language, if configured[1] |
| `outputAudioTranscription` | Optional. If set, enables transcription of the model's audio output. The transcription aligns with the language code specified for the output audio, if configured[1] |
| `proactivity` | Optional. Configures the proactivity of the model. This allows the model to respond proactively to the input and to ignore irrelevant input[1] |

### BidiGenerateContentSetupComplete

This type has no fields[1].

Sent in response to a `BidiGenerateContentSetup` message from the client[1].

### BidiGenerateContentToolCall

Request for the client to execute the `functionCalls` and return the responses with the matching `id`s[1].

| Field | Description |
|-------|-------------|
| `functionCalls[]` | Output only. The function call to be executed[1] |

### BidiGenerateContentToolCallCancellation

Notification for the client that a previously issued `ToolCallMessage` with the specified `id`s should not have been executed and should be cancelled[1]. If there were side-effects to those tool calls, clients may attempt to undo the tool calls. This message occurs only in cases where the clients interrupt server turns[1].

| Field | Description |
|-------|-------------|
| `ids[]` | Output only. The ids of the tool calls to be cancelled[1] |

### BidiGenerateContentToolResponse

Client generated response to a `ToolCall` received from the server[1]. Individual `FunctionResponse` objects are matched to the respective `FunctionCall` objects by the `id` field.

Note that in the unary and server-streaming GenerateContent APIs function calling happens by exchanging the `Content` parts, while in the bidi GenerateContent APIs function calling happens over these dedicated set of messages[1].

| Field | Description |
|-------|-------------|
| `functionResponses[]` | Optional. The response to the function calls[1] |

### BidiGenerateContentTranscription

Transcription of audio (input or output)[1].

| Field | Description |
|-------|-------------|
| `text` | Transcription text[1] |

### ContextWindowCompressionConfig

Enables context window compression — a mechanism for managing the model's context window so that it does not exceed a given length[1].

| Field | Description |
|-------|-------------|
| Union field `compressionMechanism` | The context window compression mechanism used. `compressionMechanism` can be only one of the following[1] |
| `slidingWindow` | A sliding-window mechanism[1] |
| `triggerTokens` | The number of tokens (before running a turn) required to trigger a context window compression. This can be used to balance quality against latency as shorter context windows may result in faster model responses. However, any compression operation will cause a temporary latency increase, so they should not be triggered frequently. If not set, the default is 80% of the model's context window limit. This leaves 20% for the next user request/model response[1] |

### EndSensitivity

Determines how end of speech is detected[1].

| Enum | Description |
|------|-------------|
| `END_SENSITIVITY_UNSPECIFIED` | The default is END_SENSITIVITY_HIGH[1] |
| `END_SENSITIVITY_HIGH` | Automatic detection ends speech more often[1] |
| `END_SENSITIVITY_LOW` | Automatic detection ends speech less often[1] |

### GoAway

A notice that the server will soon disconnect[1].

| Field | Description |
|-------|-------------|
| `timeLeft` | The remaining time before the connection will be terminated as ABORTED. This duration will never be less than a model-specific minimum, which will be specified together with the rate limits for the model[1] |

### ProactivityConfig

Config for proactivity features[1].

| Field | Description |
|-------|-------------|
| `proactiveAudio` | Optional. If enabled, the model can reject responding to the last prompt. For example, this allows the model to ignore out of context speech or to stay silent if the user did not make a request, yet[1] |

### RealtimeInputConfig

Configures the realtime input behavior in `BidiGenerateContent`[1].

| Field | Description |
|-------|-------------|
| `automaticActivityDetection` | Optional. If not set, automatic activity detection is enabled by default. If automatic voice detection is disabled, the client must send activity signals[1] |
| `activityHandling` | Optional. Defines what effect activity has[1] |
| `turnCoverage` | Optional. Defines which input is included in the user's turn[1] |

### SessionResumptionConfig

Session resumption configuration[1].

This message is included in the session configuration as `BidiGenerateContentSetup.sessionResumption`. If configured, the server will send `SessionResumptionUpdate` messages[1].

| Field | Description |
|-------|-------------|
| `handle` | The handle of a previous session. If not present then a new session is created. Session handles come from[1] |

### SessionResumptionUpdate

Update of the session resumption state[1].

Only sent if `BidiGenerateContentSetup.sessionResumption` was set[1].

| Field | Description |
|-------|-------------|
| `newHandle` | New handle that represents a state that can be resumed. Empty if[1] |
| `resumable` | True if the current session can be resumed at this point. Resumption is not possible at some points in the session. For example, when the model is executing function calls or generating. Resuming the session (using a previous session token) in such a state will result in some data loss. In these cases[1] |

### SlidingWindow

The SlidingWindow method operates by discarding content at the beginning of the context window[1]. The resulting context will always begin at the start of a USER role turn. System instructions and any `BidiGenerateContentSetup.prefixTurns` will always remain at the beginning of the result[1].

| Field | Description |
|-------|-------------|
| `targetTokens` | The target number of tokens to keep. The default value is trigger_tokens/2. Discarding parts of the context window causes a temporary latency increase so this value should be calibrated to avoid frequent compression operations[1] |

### StartSensitivity

Determines how start of speech is detected[1].

| Enum | Description |
|------|-------------|
| `START_SENSITIVITY_UNSPECIFIED` | The default is START_SENSITIVITY_HIGH[1] |
| `START_SENSITIVITY_HIGH` | Automatic detection will detect the start of speech more often[1] |
| `START_SENSITIVITY_LOW` | Automatic detection will detect the start of speech less often[1] |

### TurnCoverage

Options about which input is included in the user's turn[1].

| Enum | Description |
|------|-------------|
| `TURN_COVERAGE_UNSPECIFIED` | If unspecified, the default behavior is `TURN_INCLUDES_ONLY_ACTIVITY`[1] |
| `TURN_INCLUDES_ONLY_ACTIVITY` | The users turn only includes activity since the last turn, excluding inactivity (e.g. silence on the audio stream). This is the default behavior[1] |
| `TURN_INCLUDES_ALL_INPUT` | The users turn includes all realtime input since the last turn, including inactivity (e.g. silence on the audio stream)[1] |

### UrlContextMetadata

Metadata related to url context retrieval tool[1].

| Field | Description |
|-------|-------------|
| `urlMetadata[]` | List of url context[1] |

### UsageMetadata

Usage metadata about response(s)[1].

| Field | Description |
|-------|-------------|
| `promptTokenCount` | Output only. Number of tokens in the prompt. When[1] |
| `cachedContentTokenCount` | Number of tokens in the cached part of the prompt (the cached content)[1] |
| `responseTokenCount` | Output only. Total number of tokens across all the generated response candidates[1] |
| `toolUsePromptTokenCount` | Output only. Number of tokens present in tool-use prompt(s)[1] |
| `thoughtsTokenCount` | Output only. Number of tokens of thoughts for thinking models[1] |
| `totalTokenCount` | Output only. Total token count for the generation request (prompt + response candidates)[1] |
| `promptTokensDetails[]` | Output only. List of modalities that were processed in the request input[1] |
| `cacheTokensDetails[]` | Output only. List of modalities of the cached content in the request input[1] |
| `responseTokensDetails[]` | Output only. List of modalities that were returned in the response[1] |
| `toolUsePromptTokensDetails[]` | Output only. List of modalities that were processed for tool-use request inputs[1] |

## Ephemeral Authentication Tokens

Ephemeral authentication tokens can be obtained by calling `AuthTokenService.CreateToken` and then used with `GenerativeService.BidiGenerateContentConstrained`, either by passing the token in an `access_token` query parameter, or in an HTTP `Authorization` header with `Token` prefixed to it[1].

### CreateAuthTokenRequest

Create an ephemeral authentication token[1].

| Field | Description |
|-------|-------------|
| `authToken` | Required. The token to create[1] |

### AuthToken

A request to create an ephemeral authentication token[1].

| Field | Description |
|-------|-------------|
| `name` | Output only. Identifier. The token itself[1] |
| `expireTime` | Optional. Input only. Immutable. An optional time after which, when using the resulting token, messages in BidiGenerateContent sessions will be rejected. (Gemini may preemptively close the session after this time.) If not set then this defaults to 30 minutes in the future. If set, this value must be less than 20 hours in the future[1] |
| `newSessionExpireTime` | Optional. Input only. Immutable. The time after which new Live API sessions using the token resulting from this request will be rejected. If not set this defaults to 60 seconds in the future. If set, this value must be less than 20 hours in the future[1] |
| `fieldMask` | Optional. Input only. Immutable. If field_mask is empty, and If field_mask is empty, and If field_mask is not empty, then the corresponding fields from[1] |
| Union field `config` | The method-specific configuration for the resulting token. `config` can be only one of the following[1] |
| `bidiGenerateContentSetup` | Optional. Input only. Immutable. Configuration specific to[1] |
| `uses` | Optional. Input only. Immutable. The number of times the token can be used. If this value is zero then no limit is applied. Resuming a Live API session does not count as a use. If unspecified, the default is 1[1] |

## More Information on Common Types

For more information on the commonly-used API resource types `Blob`, `Content`, `FunctionCall`, `FunctionResponse`, `GenerationConfig`, `GroundingMetadata`, `ModalityTokenCount`, and `Tool`, see Generating content[1].

[1] https://ai.google.dev/api/live