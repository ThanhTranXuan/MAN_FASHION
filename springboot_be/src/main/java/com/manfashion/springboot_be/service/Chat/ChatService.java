//package com.manfashion.springboot_be.service.Chat;
//
//import com.manfashion.springboot_be.entity.ChatConversation;
//import com.manfashion.springboot_be.entity.ChatMessage;
//import com.manfashion.springboot_be.entity.User;
//import com.manfashion.springboot_be.repository.Category.CategoryRepository;
//import com.manfashion.springboot_be.repository.Chat.ChatMessageRepository;
//import com.manfashion.springboot_be.repository.User.UserRepository;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.stereotype.Service;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class ChatService {
//
//    private final ChatConversationRepository conversationRepo;
//    private final ChatMessageRepository messageRepo;
//    private final UserRepository userRepository;
//    private final SimpMessagingTemplate messagingTemplate;
//    private final GroqService groqService;
//    private final ProductSearchService productSearchService;
//    private final CategoryRepository categoryRepository;
//
//    // Helper: Get display name from User
//    private String getDisplayName(ObjectId userId) {
//        return userRepository.findById(userId)
//                .map(User::getFullName)
//                .orElse("Customer");
//    }
//
//    private void sendWelcomeBotMessage(ChatConversation conv) {
//        String welcomeContent = "Hello! How can I assist you today?";
//
//        ChatMessage botMsg = ChatMessage.builder()
//                .conversationId(conv.getId())
//                .senderId(null)
//                .senderName("Trendify Bot")
//                .senderType("BOT")
//                .content(welcomeContent)
//                .createdAt(Instant.now())
//                .build();
//
//        messageRepo.save(botMsg);
//        updateConversationSummary(conv, welcomeContent.substring(0, Math.min(welcomeContent.length(), 100)), Instant.now());
//        messagingTemplate.convertAndSend("/topic/chat/" + conv.getId().toHexString(), toMessageDto(botMsg));
//    }
//
//    public ChatConversationSummary startOrGetConversationForUser(ObjectId userId) {
//        Optional<ChatConversation> existed = conversationRepo.findFirstByUserIdOrderByCreatedAtDesc(userId);
//
//        if (existed.isPresent()) {
//            return toSummary(existed.get());
//        }
//
//        Instant now = Instant.now();
//        String userName = getDisplayName(userId);
//
//        ChatConversation conv = ChatConversation.builder()
//                .userId(userId)
//                .userName(userName)
//                .status("OPEN")
//                .createdAt(now)
//                .updatedAt(now)
//                .lastMessageText("Hello! How can I assist you today?")
//                .lastMessageAt(now)
//                .build();
//
//        conv = conversationRepo.save(conv);
//        sendWelcomeBotMessage(conv);
//        return toSummary(conv);
//    }
//
//    public ChatConversationSummary getMyConversation(ObjectId userId) {
//        return conversationRepo.findFirstByUserIdOrderByCreatedAtDesc(userId)
//                .map(this::toSummary)
//                .orElse(null);
//    }
//
//    public Page<ChatConversationSummary> getAllConversationsForStaffPaged(int page, int size) {
//        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "lastMessageAt"));
//        Page<ChatConversation> raw = conversationRepo.findAll(pageable);
//
//        List<ChatConversationSummary> content = raw.getContent().stream()
//                .map(this::toSummary)
//                .collect(Collectors.toList());
//
//        return new PageImpl<>(content, pageable, raw.getTotalElements());
//    }
//
//    public Page<ChatMessageResponse> getMessagesPaged(String conversationIdHex, int page, int size) {
//        ObjectId convId = new ObjectId(conversationIdHex);
//        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
//
//        Page<ChatMessage> raw = messageRepo.findByConversationIdOrderByCreatedAtDesc(convId, pageable);
//
//        List<ChatMessageResponse> reversed = raw.getContent().stream()
//                .map(this::toMessageDto)
//                .collect(Collectors.toList());
//        Collections.reverse(reversed);
//
//        return new PageImpl<>(reversed, pageable, raw.getTotalElements());
//    }
//
//    public void receiveFromWebSocket(ChatMessageRequest req, ObjectId senderId, boolean isStaff) {
//        ObjectId convId = new ObjectId(req.getConversationId());
//
//        String rawContent = req.getContent();
//        if (rawContent == null || rawContent.trim().isEmpty()) return;
//
//        String content = rawContent.trim();
//
//        // Detect message sent to SHOP (from FE: [SHOP] ...)
//        boolean isShopMessage = content.startsWith("[SHOP]");
//        if (isShopMessage) {
//            content = content.replaceFirst("^\\[SHOP\\]\\s*", "");
//        }
//
//        ChatConversation conv = conversationRepo.findById(convId)
//                .orElseThrow(() -> new RuntimeException("Conversation not found"));
//
//        Instant now = Instant.now();
//        String senderName = getDisplayName(senderId);
//
//        ChatMessage userMsg = ChatMessage.builder()
//                .conversationId(convId)
//                .senderId(senderId)
//                .senderName(senderName)
//                .senderType(isStaff ? "EMPLOYEE" : "USER")
//                .content(content)
//                .createdAt(now)
//                .build();
//
//        messageRepo.save(userMsg);
//        updateConversationSummary(conv, content, now);
//
//        // Broadcast message to frontend
//        messagingTemplate.convertAndSend("/topic/chat/" + convId.toHexString(), toMessageDto(userMsg));
//
//        // Staff messages → no bot reply
//        if (isStaff) {
//            log.info("Staff {} sent: {}", senderId, content);
//            return;
//        }
//
//        // Messages prefixed with [SHOP] → no bot reply
//        if (isShopMessage) {
//            log.info("User {} sent message to SHOP (bot ignored): {}", senderId, content);
//            return;
//        }
//
//        // Normal user → bot replies
//        log.info("Customer {} asked (BOT): {}", senderId, content);
//        generateAndSendBotReply(convId, content);
//    }
//
//    private String detectProductIntent(String msg) {
//        String lower = msg.toLowerCase();
//
//        if (contains(lower, "polo")) return "polo";
//        if (contains(lower, "t-shirt", "tee", "tshirt")) return "tshirt";
//        if (contains(lower, "hoodie", "hooded")) return "hoodie";
//        if (contains(lower, "sweater", "knit")) return "sweater";
//        if (contains(lower, "shirt", "dress shirt", "button-up", "oxford", "formal shirt")) return "shirt";
//        if (contains(lower, "jacket", "coat", "blazer", "bomber", "parka")) return "jacket";
//        if (contains(lower, "puffer", "down jacket")) return "puffer";
//        if (contains(lower, "windbreaker")) return "windbreaker";
//        if (contains(lower, "vest", "waistcoat")) return "vest";
//        if (contains(lower, "jeans", "denim")) return "jeans";
//        if (contains(lower, "shorts", "short")) return "shorts";
//        if (contains(lower, "khaki", "chino")) return "khaki";
//        if (contains(lower, "trousers", "dress pants", "formal pants", "slacks")) return "trousers";
//        if (contains(lower, "jogger", "sweatpants")) return "jogger";
//        if (contains(lower, "dress")) return "dress";
//        if (contains(lower, "skirt")) return "skirt";
//        if (contains(lower, "sportswear", "activewear", "gym")) return "sportswear";
//        if (contains(lower, "underwear", "bra", "panty", "briefs")) return "innerwear";
//        if (contains(lower, "set", "combo", "outfit")) return "set";
//        if (contains(lower, "socks")) return "socks";
//
//        return null;
//    }
//
//    private String determineCategorySlugForKid(boolean isKid, String gender) {
//        if (!isKid) return null;
//        return "kids";
//    }
//
//    private String mapVietnameseToEnglishKeyword(String productType) {
//        return switch (productType) {
//            case "polo" -> "Polo";
//            case "tshirt" -> "tshirt";
//            case "hoodie" -> "hoodie";
//            case "shirt" -> "shirt";
//            case "sweater" -> "sweater";
//            case "jacket" -> "jacket";
//            case "jeans" -> "jeans";
//            case "shorts" -> "shorts";
//            case "khaki" -> "khaki";
//            case "formal" -> "Dress Pants/ Formal Trousers";
//            case "dress" -> "dress skirt";
//            case "innerwear" -> "innerwear";
//            case "sportswear" -> "sportswear";
//            case "set" -> "set";
//            case "socks" -> "sock";
//            default -> productType;
//        };
//    }
//
//    private boolean contains(String text, String... keywords) {
//        for (String kw : keywords) {
//            if (text.contains(kw)) return true;
//        }
//        return false;
//    }
//
//    @Async
//    public void generateAndSendBotReply(ObjectId convId, String userMessage) {
//        try {
//            final ChatConversation conv = conversationRepo.findById(convId)
//                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
//
//            String msgLower = userMessage.toLowerCase();
//
//            // === 1. Detect & update người mặc (me / wife / kid / other) ===
//            String detectedRecipient = detectRecipient(userMessage);
//            String previousRecipient = conv.getCurrentRecipient();
//            if (detectedRecipient != null) {
//                conv.setCurrentRecipient(detectedRecipient);
//            }
//            String recipient = conv.getCurrentRecipient();
//            if (recipient == null) recipient = "me"; // mặc định là cho chính mình
//
//            boolean isForKid = "kid".equals(recipient);
//            boolean isForOtherAdult = !"me".equals(recipient) && !"kid".equals(recipient);
//
//            if (previousRecipient != null && !previousRecipient.equals(recipient)) {
//                conv.setLastSearchResults(null);
//                conv.setLastSearchKeyword(null);
//                conv.setRefinementStyle(null);
//                log.info("Recipient changed from {} to {} → reset search context", previousRecipient, recipient);
//                conversationRepo.save(conv);
//            }
//
//            // === 2. Detect gender ===
//            String detectedGender = detectGender(userMessage);
//            if (detectedGender != null) {
//                conv.setCollectedGender(detectedGender);
//                conversationRepo.save(conv);
//            }
//
//            // === 3. Detect product intent + reset context khi đổi sản phẩm ===
//            String currentProductType = detectProductIntent(userMessage);
//            if (currentProductType != null) {
//                if (conv.getPendingProductType() != null && !currentProductType.equals(conv.getPendingProductType())) {
//                    conv.setLastSearchResults(null);
//                    conv.setLastSearchKeyword(null);
//                    conv.setRefinementStyle(null);
//                    log.info("Product changed → reset context");
//                }
//                conv.setPendingProductType(currentProductType);
//                conversationRepo.save(conv);
//            }
//
//            String productType = conv.getPendingProductType() != null ? conv.getPendingProductType() : currentProductType;
//            if (productType == null) {
//                sendBotMessage(convId, "I'm not sure what you're looking for yet. Tell me what kind of clothing you need!");
//                return;
//            }
//
//            // === 4. Xử lý số đo theo người mặc ===
//            int inputHeight = extractHeight(userMessage);
//            int inputWeight = extractWeight(userMessage);
//
//            int currentHeight = 0, currentWeight = 0;
//
//            if ("me".equals(recipient)) {
//                if (inputHeight > 0) conv.setCollectedHeight(inputHeight);
//                if (inputWeight > 0) conv.setCollectedWeight(inputWeight);
//                currentHeight = conv.getCollectedHeight() != null ? conv.getCollectedHeight() : 0;
//                currentWeight = conv.getCollectedWeight() != null ? conv.getCollectedWeight() : 0;
//            } else if (isForKid) {
//                if (inputHeight > 0) conv.setCollectedKidHeight(inputHeight);
//                if (inputWeight > 0) conv.setCollectedKidWeight(inputWeight);
//                currentHeight = conv.getCollectedKidHeight() != null ? conv.getCollectedKidHeight() : 0;
//                currentWeight = conv.getCollectedKidWeight() != null ? conv.getCollectedKidWeight() : 0;
//            } else {
//                // Vợ/chồng/bạn bè
//                if (inputHeight > 0) conv.setCollectedHeightForRecipient(inputHeight);
//                if (inputWeight > 0) conv.setCollectedWeightForRecipient(inputWeight);
//                currentHeight = conv.getCollectedHeightForRecipient() != null ? conv.getCollectedHeightForRecipient() : 0;
//                currentWeight = conv.getCollectedWeightForRecipient() != null ? conv.getCollectedWeightForRecipient() : 0;
//            }
//
//            conversationRepo.save(conv);
//
//            // === 5. Kiểm tra đủ thông tin chưa ===
//            boolean hasSizeInfo = currentHeight > 0 && currentWeight > 0;
//            boolean hasGender = conv.getCollectedGender() != null;
//
//            if (!hasGender || !hasSizeInfo) {
//                String whoText = switch (recipient) {
//                    case "wife" -> "your wife";
//                    case "husband" -> "your husband";
//                    case "kid" -> "your child";
//                    case "friend" -> "your friend";
//                    default -> "you";
//                };
//
//                String productName = getProductDisplayName(productType);
//                StringBuilder ask = new StringBuilder("You're looking for " + productName);
//                if (!"me".equals(recipient)) ask.append(" for ").append(whoText);
//                ask.append(".\n\n");
//
//                if (!hasGender && !isForKid) {
//                    ask.append("• Is it for male or female?\n");
//                }
//                if (!hasSizeInfo) {
//                    ask.append("• What's the height and weight of ").append(whoText).append("? (e.g. 165cm, 55kg)\n");
//                }
//                ask.append("\nI'll recommend the perfect fit!");
//                sendBotMessage(convId, ask.toString());
//                return;
//            }
//
//            // === 6. Tìm sản phẩm ===
//            String categorySlug = isForKid ? "kids" : null;
//            String englishKeyword = mapVietnameseToEnglishKeyword(productType);
//
//            log.info("SMART SEARCH → Keyword: [{}], Height: {}cm, Weight: {}kg, Kid: {}", englishKeyword, currentHeight, currentWeight, isForKid);
//
//            List<Map<String, Object>> products = productSearchService.searchRelevantProducts(
//                    englishKeyword, currentHeight, currentWeight, categorySlug);
//
//            // Gender filter (giữ nguyên logic cũ)
//            if (conv.getCollectedGender() != null) {
//                String g = conv.getCollectedGender();
//                products = products.stream()
//                        .filter(p -> {
//                            String name = Objects.toString(p.get("name"), "").toLowerCase();
//                            String cat = Objects.toString(p.get("categoryName"), "").toLowerCase();
//                            String combined = name + " " + cat;
//                            if ("male".equals(g) && combined.contains("women")) return false;
//                            if ("female".equals(g) && combined.contains("men")) return false;
//                            return true;
//                        })
//                        .collect(Collectors.toList());
//            }
//
//            if (conv.getLastSearchResults() == null || conv.getLastSearchResults().isEmpty()) {
//                conv.setLastSearchResults(new ArrayList<>(products));
//                conv.setLastSearchKeyword(productType);
//                conversationRepo.save(conv);
//            }
//
//            String style = detectStyle(userMessage);
//            if (style != null) {
//                conv.setRefinementStyle(style);
//                conversationRepo.save(conv);
//            }
//
//            if (conv.getRefinementStyle() != null && conv.getLastSearchResults() != null) {
//                products = filterByStyle(conv.getLastSearchResults(), conv.getRefinementStyle());
//                if (products.isEmpty()) {
//                    String fallback = switch (conv.getRefinementStyle()) {
//                        case "formal" -> "dress shirt";
//                        case "polo" -> "polo shirt";
//                        case "sport" -> "sport t-shirt";
//                        case "denim" -> "denim shirt";
//                        default -> productType;
//                    };
//                    products = productSearchService.searchRelevantProducts(fallback, currentHeight, currentWeight, categorySlug);
//                }
//            }
//
//            // === 8. Trả kết quả ===
//            String reply = products.isEmpty()
//                    ? "Sorry, I couldn't find any matching items. Please try different keywords!"
//                    : ""; // để trống vì sẽ gửi từng phần
//
//            conversationRepo.save(conv);
//
//            if (!products.isEmpty()) {
//                // Gửi từng sản phẩm riêng biệt
//                sendProductCardsIndividually(convId, recipient, productType, products, currentHeight, currentWeight, isForKid);
//            } else {
//                sendBotMessage(convId, reply);
//            }
//
//        } catch (Exception e) {
//            log.error("Bot reply error", e);
//            sendBotMessage(convId, "Sorry, please try again in a moment!");
//        }
//    }
//
//    private void sendProductCardsIndividually(
//            ObjectId convId,
//            String recipient,
//            String productType,
//            List<Map<String, Object>> products,
//            int height, int weight,
//            boolean isKid) {
//
//        String size = suggestSizeDetailed(height, weight, isKid);
//        String who = switch (recipient) {
//            case "wife" -> "your wife's";
//            case "husband" -> "your husband's";
//            case "kid" -> "your child's";
//            case "friend" -> "your friend's";
//            default -> "your";
//        };
//
//        // Tin nhắn đầu: thông báo size
//        String intro = String.format(
//                "With %s height **%dcm** and weight **%dkg**, I recommend **%s**!\n",
//                who, height, weight, size);
//
//        if (!isKid) {
//            intro += "• Relaxed/oversize → **" + getNextSize(size) + "**\n";
//            intro += "• Slim/tight fit → **" + size + "**\n";
//        }
//        intro += "\nHere are the best matches for you:";
//        sendBotMessage(convId, intro);
//
//        // Gửi từng sản phẩm thành 1 tin riêng
//        int count = 1;
//        for (Map<String, Object> p : products) {
//            if (count > 6) break; // tối đa 6 sản phẩm để không spam
//
//            String name = (String) p.get("name");
//            Double price = (Double) p.get("price");
//            String slug = (String) p.get("slug");
//            String priceStr = String.format("$%,.2f", price);
//
//            StringBuilder card = new StringBuilder();
//            card.append(String.format("%d. **%s**\n", count++, name));
//            card.append("   Price: ").append(priceStr).append("\n");
//            card.append("   View: http://localhost:3000/user/product/detail/").append(slug).append("\n\n");
//
//            // Ảnh thumbnail
//            @SuppressWarnings("unchecked")
//            List<com.example.SpringBoot_BE.dto.response.productImage.ProductImageResponse> images =
//                    (List<com.example.SpringBoot_BE.dto.response.productImage.ProductImageResponse>) p.get("images");
//
//            if (images != null) {
//                images.stream()
//                        .filter(img -> Boolean.TRUE.equals(img.getIsThumbnail()) && img.getUrl() != null && !img.getUrl().isBlank())
//                        .findFirst()
//                        .ifPresent(img -> card.append(img.getUrl()).append("\n\n"));
//            }
//
//            sendBotMessage(convId, card.toString());
//        }
//    }
//
//    private String detectRecipient(String msg) {
//        String lower = msg.toLowerCase();
//        if (contains(lower, "vợ", "wife", "cho vợ", "my wife", "cho chị ấy", "bà xã")) return "wife";
//        if (contains(lower, "chồng", "husband", "cho chồng", "my husband")) return "husband";
//        if (contains(lower, "con", "kid", "child", "son", "daughter", "bé", "cho con", "my kid")) return "kid";
//        if (contains(lower, "bạn", "friend", "cho bạn", "người yêu", "girlfriend", "boyfriend")) return "friend";
//        if (contains(lower, "tôi", "mình", "cho mình", "me", "myself", "cho tôi")) return "me";
//        return null;
//    }
//
//    private String detectStyle(String msg) {
//        String lower = msg.toLowerCase();
//
//        if (contains(lower, "formal", "dress shirt", "button-up", "button-down", "oxford", "office", "business", "work", "professional"))
//            return "formal";
//
//        if (contains(lower, "casual", "everyday", "daily", "relaxed", "chill"))
//            return "casual";
//
//        if (contains(lower, "oversize", "baggy", "loose", "streetwear", "street style"))
//            return "oversize";
//
//        if (contains(lower, "sport", "gym", "active", "workout", "training"))
//            return "sport";
//
//        if (contains(lower, "polo"))
//            return "polo";
//
//        if (contains(lower, "denim"))
//            return "denim";
//
//        return null;
//    }
//
//    private List<Map<String, Object>> filterByStyle(List<Map<String, Object>> products, String style) {
//        return products.stream()
//                .filter(p -> {
//                    String name = Optional.ofNullable(p.get("name")).map(Object::toString).orElse("").toLowerCase();
//                    String cat = Optional.ofNullable(p.get("categoryName")).map(Object::toString).orElse("").toLowerCase();
//                    String combined = (name + " " + cat);
//
//                    return switch (style) {
//                        case "formal" -> cat.contains("dress shirts") || cat.contains("formal") || name.contains("dress shirt") || name.contains("oxford") || name.contains("button");
//                        case "casual" -> cat.contains("t-shirts") || cat.contains("casual shirts") || name.contains("t-shirt") || name.contains("graphic") || name.contains("basic");
//                        case "polo" -> cat.contains("polo shirts") || name.contains("polo");
//                        case "oversize" -> name.contains("oversize") || name.contains("oversized") || name.contains("baggy");
//                        case "sport" -> cat.contains("sport") || name.contains("sport") || name.contains("active") || name.contains("gym");
//                        case "denim" -> cat.contains("denim") || name.contains("denim") || cat.contains("jeans");
//                        default -> true;
//                    };
//                })
//                .collect(Collectors.toList());
//    }
//
//    private String generateResponseWithProductsAndSize(String recipient, String productType,
//                                                       List<Map<String, Object>> products,
//                                                       int height, int weight, boolean isKid) {
//        StringBuilder sb = new StringBuilder();
//
//        String size = suggestSizeDetailed(height, weight, isKid);
//        String who = switch (recipient) {
//            case "wife" -> "your wife's";
//            case "husband" -> "your husband's";
//            case "kid" -> "your child's";
//            case "friend" -> "your friend's";
//            default -> "your";
//        };
//
//        sb.append(String.format("With %s height **%dcm** and weight **%dkg**, I recommend **%s**!\n", who, height, weight, size));
//        if (!isKid) {
//            sb.append("• Relaxed/oversize look → **").append(getNextSize(size)).append("**\n");
//            sb.append("• Slim/tight fit → **").append(size).append("**\n");
//        }
//        sb.append("\nHere are the top matches:\n\n");
//
//        int count = 0;
//        for (Map<String, Object> p : products) {
//            if (count++ >= 3) break;
//            String name = (String) p.get("name");
//            Double price = (Double) p.get("price");
//            String slug = (String) p.get("slug");
//            String priceStr = String.format("$%,.2f", price);
//
//            sb.append(count).append(". **").append(name).append("**\n")
//                    .append("   Price: ").append(priceStr).append("\n")
//                    .append("   View: http://localhost:3000/user/product/detail/").append(slug).append("\n\n");
//
//            @SuppressWarnings("unchecked")
//            List<com.example.SpringBoot_BE.dto.response.productImage.ProductImageResponse> images =
//                    (List<com.example.SpringBoot_BE.dto.response.productImage.ProductImageResponse>) p.get("images");
//            if (images != null) {
//                images.stream()
//                        .filter(img -> Boolean.TRUE.equals(img.getIsThumbnail()) && img.getUrl() != null)
//                        .findFirst()
//                        .ifPresent(img -> sb.append(img.getUrl()).append("\n\n"));
//            }
//        }
//        return sb.toString();
//    }
//
//
//    private String getProductDisplayName(String productType) {
//        return switch (productType) {
//            case "polo" -> "polo shirt";
//            case "T-shirts", "tshirt" -> "T-shirt";
//            case "hoodie" -> "hoodie";
//            case "shirt" -> "shirt";
//            case "sweater" -> "sweater";
//            case "jacket", "puffer", "windbreaker", "blazer", "bomber", "parka" -> "jacket";
//            case "jeans" -> "jeans";
//            case "shorts" -> "shorts";
//            case "khaki" -> "khaki pants";
//            case "dress" -> "dress";
//            case "innerwear" -> "underwear";
//            case "sportswear" -> "sportswear";
//            case "set" -> "outfit set";
//            case "socks" -> "socks";
//            default -> "item";
//        };
//    }
//
//    private String suggestSizeDetailed(int height, int weight, boolean isKid) {
//        if (isKid) {
//            if (height <= 100) return "2-4Y";
//            if (height <= 115) return "4-6Y";
//            if (height <= 130) return "6-8Y";
//            if (height <= 140) return "8-10Y";
//            if (height <= 150) return "10-12Y";
//            if (height <= 160) return "12-14Y";
//            return "14-16Y";
//        }
//
//        double bmi = weight / Math.pow(height / 100.0, 2);
//        if (bmi >= 28) return "3XL";
//        if (bmi >= 26) return "2XL";
//        if (bmi >= 24) return "XL";
//        if (bmi >= 21) return "L";
//        return "M";
//    }
//
//    private String getNextSize(String current) {
//        return switch (current) {
//            case "M" -> "L";
//            case "L" -> "XL";
//            case "XL" -> "2XL";
//            case "2XL" -> "3XL";
//            default -> "3XL";
//        };
//    }
//
//    private void sendBotMessage(ObjectId convId, String content) {
//        ChatMessage botMsg = ChatMessage.builder()
//                .conversationId(convId)
//                .senderId(null)
//                .senderName("Trendify Bot")
//                .senderType("BOT")
//                .content(content)
//                .createdAt(Instant.now())
//                .build();
//
//        messageRepo.save(botMsg);
//        ChatConversation conv = conversationRepo.findById(convId).orElse(null);
//        if (conv != null) {
//            updateConversationSummary(conv, content.substring(0, Math.min(content.length(), 100)), Instant.now());
//        }
//        messagingTemplate.convertAndSend("/topic/chat/" + convId.toHexString(), toMessageDto(botMsg));
//    }
//
//    private String generateResponseWithRealProducts(ChatConversation conv, String userMessage, List<Map<String, Object>> products, int height, int weight) {
//        StringBuilder sb = new StringBuilder();
//
//        sb.append(String.format("With height %dcm and weight %dkg, here are the best matches:\n\n", height, weight));
//
//        int count = 0;
//        for (Map<String, Object> p : products) {
//            if (count >= 3) break;
//            count++;
//
//            String name = (String) p.get("name");
//            Double price = (Double) p.get("price");
//            String slug = (String) p.get("slug");
//
//            String formattedPrice = String.format("$%,.2f", price);
//
//            sb.append(count).append(". ").append(name).append("\n")
//                    .append("   Price: ").append(formattedPrice).append("\n")
//                    .append("   View: http://localhost:3000/user/product/detail/").append(slug).append("\n\n");
//
//            @SuppressWarnings("unchecked")
//            List<com.example.SpringBoot_BE.dto.response.productImage.ProductImageResponse> images =
//                    (List<com.example.SpringBoot_BE.dto.response.productImage.ProductImageResponse>) p.get("images");
//
//            if (images != null) {
//                for (var img : images) {
//                    if (Boolean.TRUE.equals(img.getIsThumbnail())) {
//                        String url = img.getUrl();
//                        if (url != null && !url.isBlank()) {
//                            sb.append(url).append("\n\n");
//                        }
//                        break;
//                    }
//                }
//            }
//        }
//
//        sb.append("Let me know which one you like — I can help with size, color, and availability!\n")
//                .append("Want to see more? Just say the word!");
//
//        return sb.toString();
//    }
//
//    private String detectGender(String msg) {
//        String lower = msg.toLowerCase();
//
//        if (contains(lower, "male", "men", "man", "for men", "for him", "boy")) {
//            return "male";
//        }
//        if (contains(lower, "female", "women", "woman", "for women", "for her", "girl")) {
//            return "female";
//        }
//
//        if (contains(lower, "kid", "kids", "child", "children", "baby", "toddler", "son", "daughter")) {
//            return "kid"; // ← cố định, không cần biết boy hay girl
//        }
//
//        return null;
//    }
//
//    private int extractHeight(String msg) {
//        String text = " " + msg.toLowerCase().replaceAll("\\s+", " ") + " ";
//
//        var m = Pattern.compile("(\\d{3,4}(?:[.,]\\d{1,2})?)\\s*(?:cm)\\b").matcher(text);
//        if (m.find()) {
//            String num = m.group(1).replace(",", ".");
//            return (int) Double.parseDouble(num);
//        }
//
//        m = Pattern.compile("\\b(1[4-9][0-9]|200)\\b").matcher(text);
//        if (m.find()) {
//            return Integer.parseInt(m.group(1));
//        }
//
//        return 0;
//    }
//
//    private int extractWeight(String msg) {
//        String text = msg.toLowerCase();
//
//        var m = Pattern.compile("(\\d{2,3}(?:[.,]\\d{1,2})?)\\s*(?:kg)\\b").matcher(text);
//        if (m.find()) {
//            String num = m.group(1).replace(",", ".");
//            return (int) Double.parseDouble(num);
//        }
//
//        return 0;
//    }
//
//    private void updateConversationSummary(ChatConversation conv, String lastText, Instant lastAt) {
//        if (conv == null) return;
//        conv.setLastMessageText(lastText);
//        conv.setLastMessageAt(lastAt);
//        conv.setUpdatedAt(lastAt);
//        conversationRepo.save(conv);
//    }
//
//    private ChatConversationSummary toSummary(ChatConversation c) {
//        return new ChatConversationSummary(
//                c.getId().toHexString(),
//                c.getUserName(),
//                c.getLastMessageText(),
//                c.getLastMessageAt(),
//                c.getStatus()
//        );
//    }
//
//    private ChatMessageResponse toMessageDto(ChatMessage m) {
//        return new ChatMessageResponse(
//                m.getId().toHexString(),
//                m.getSenderType(),
//                m.getSenderName(),
//                m.getContent(),
//                m.getCreatedAt()
//        );
//    }
//}
