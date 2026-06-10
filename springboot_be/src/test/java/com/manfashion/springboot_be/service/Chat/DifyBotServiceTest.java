package com.manfashion.springboot_be.service.Chat;

import com.manfashion.springboot_be.repository.Order.OrderRepository;
import com.manfashion.springboot_be.repository.Product.ProductRepository;
import com.manfashion.springboot_be.service.Order.OrderService;
import com.manfashion.springboot_be.service.Return.ReturnOrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.net.http.HttpTimeoutException;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DifyBotServiceTest {

    private RestClient restClient;
    private RestClient.RequestBodyUriSpec uriSpec;
    private RestClient.RequestBodySpec bodySpec;
    private RestClient.ResponseSpec responseSpec;
    private DifyBotService service;

    @BeforeEach
    void setUp() {
        restClient = mock(RestClient.class);
        uriSpec = mock(RestClient.RequestBodyUriSpec.class);
        bodySpec = mock(RestClient.RequestBodySpec.class);
        responseSpec = mock(RestClient.ResponseSpec.class);
        when(restClient.post()).thenReturn(uriSpec);
        when(uriSpec.uri(anyString())).thenReturn(bodySpec);
        when(bodySpec.header(anyString(), any(String[].class))).thenReturn(bodySpec);
        when(bodySpec.body(any(Object.class))).thenReturn(bodySpec);
        when(bodySpec.retrieve()).thenReturn(responseSpec);

        service = new DifyBotService(
                restClient,
                mock(ProductRepository.class),
                mock(OrderRepository.class),
                mock(OrderService.class),
                mock(ReturnOrderService.class)
        );
        ReflectionTestUtils.setField(service, "apiKey", "test-key");
        ReflectionTestUtils.setField(service, "apiUrl", "https://api.dify.test/v1/chat-messages");
        ReflectionTestUtils.setField(service, "requestTimeoutSeconds", 45L);
    }

    @Test
    void returnsDifyAnswerForSuccessfulResponse() {
        stubResponse(Map.of("answer", "Xin chào", "conversation_id", "conv-1"));

        assertThat(service.askBot("session-1", "Xin chào")).isEqualTo("Xin chào");
    }

    @Test
    void returnsFriendlyMessageForTimeout() {
        stubFailure(new ResourceAccessException(
                "I/O error: Request cancelled",
                new HttpTimeoutException("Request cancelled")
        ));

        assertThat(service.askBot("session-1", "Tư vấn áo sơ mi"))
                .isEqualTo("Hiện tại trợ lý phản hồi hơi chậm. Bạn thử gửi lại câu hỏi ngắn hơn hoặc thử lại sau ít phút nhé.");
    }

    @Test
    void returnsConfigurationMessageForUnauthorizedResponses() {
        stubFailure(HttpClientErrorException.create(HttpStatus.UNAUTHORIZED, "Unauthorized", null, null, null));

        assertThat(service.askBot("session-1", "Xin chào"))
                .isEqualTo("Trợ lý đang gặp lỗi cấu hình. Vui lòng thử lại sau.");
    }

    @Test
    void returnsConfigurationMessageForForbiddenResponses() {
        stubFailure(HttpClientErrorException.create(HttpStatus.FORBIDDEN, "Forbidden", null, null, null));

        assertThat(service.askBot("session-1", "Xin chào"))
                .isEqualTo("Trợ lý đang gặp lỗi cấu hình. Vui lòng thử lại sau.");
    }

    @Test
    void returnsRateLimitMessageForTooManyRequests() {
        stubFailure(HttpClientErrorException.create(HttpStatus.TOO_MANY_REQUESTS, "Too Many Requests", null, null, null));

        assertThat(service.askBot("session-1", "Xin chào"))
                .isEqualTo("Trợ lý đang nhận quá nhiều yêu cầu. Bạn thử lại sau ít phút nhé.");
    }

    @Test
    void returnsRateLimitMessageWhenDifyWrapsUpstreamQuotaAsBadRequest() {
        String responseBody = """
                {"code":"invalid_param","message":"429 RESOURCE_EXHAUSTED. Quota exceeded for Gemini model"}
                """;
        stubFailure(HttpClientErrorException.create(
                HttpStatus.BAD_REQUEST,
                "Bad Request",
                HttpHeaders.EMPTY,
                responseBody.getBytes(),
                null
        ));

        assertThat(service.askBot("guest-session", "Xin chào"))
                .isEqualTo("Trợ lý đang nhận quá nhiều yêu cầu. Bạn thử lại sau ít phút nhé.");
    }

    @Test
    void returnsBusyMessageForDifyServerError() {
        stubFailure(HttpServerErrorException.create(HttpStatus.SERVICE_UNAVAILABLE, "Unavailable", null, null, null));

        assertThat(service.askBot("session-1", "Xin chào"))
                .isEqualTo("Dịch vụ trợ lý đang bận. Bạn vui lòng thử lại sau nhé.");
    }

    @Test
    void returnsInvalidResponseMessageForEmptyResponse() {
        stubResponse(null);

        assertThat(service.askBot("session-1", "Xin chào"))
                .isEqualTo("Trợ lý chưa nhận được phản hồi phù hợp. Bạn thử hỏi lại rõ hơn nhé.");
    }

    @Test
    void returnsInvalidResponseMessageForBlankAnswer() {
        stubResponse(Map.of(
                "event", "message",
                "mode", "advanced-chat",
                "answer", "   "
        ));

        assertThat(service.askBot("session-1", "Xin chào"))
                .isEqualTo("Trợ lý chưa nhận được phản hồi phù hợp. Bạn thử hỏi lại rõ hơn nhé.");
    }

    @Test
    void readsAnswerFromNestedWorkflowOutputs() {
        stubResponse(Map.of(
                "event", "workflow_finished",
                "data", Map.of("outputs", Map.of("answer", "Kết quả workflow"))
        ));

        assertThat(service.askBot("session-1", "Xin chào"))
                .isEqualTo("Kết quả workflow");
    }

    @Test
    void reusesConversationIdAndKeepsItWhenNextRequestTimesOut() {
        when(responseSpec.body(Map.class))
                .thenReturn(Map.of("answer", "Câu trả lời đầu", "conversation_id", "dify-conv-1"))
                .thenThrow(new ResourceAccessException(
                        "I/O error: Request cancelled",
                        new HttpTimeoutException("Request cancelled")
                ));

        assertThat(service.askBot("session-1", "Câu đầu")).isEqualTo("Câu trả lời đầu");
        assertThat(service.askBot("session-1", "Câu tiếp"))
                .isEqualTo("Hiện tại trợ lý phản hồi hơi chậm. Bạn thử gửi lại câu hỏi ngắn hơn hoặc thử lại sau ít phút nhé.");

        ArgumentCaptor<Object> requestCaptor = ArgumentCaptor.forClass(Object.class);
        verify(bodySpec, times(2)).body(requestCaptor.capture());
        Map<?, ?> secondRequest = (Map<?, ?>) requestCaptor.getAllValues().get(1);
        assertThat(secondRequest.get("conversation_id")).isEqualTo("dify-conv-1");
    }

    @SuppressWarnings("unchecked")
    private void stubResponse(Map<String, Object> response) {
        when(responseSpec.body(Map.class)).thenReturn(response);
    }

    @SuppressWarnings("unchecked")
    private void stubFailure(RuntimeException exception) {
        when(responseSpec.body(Map.class)).thenThrow(exception);
    }
}
