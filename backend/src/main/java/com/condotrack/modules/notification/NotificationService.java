package com.condotrack.modules.notification;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/** Sends non-blocking notifications when a package arrives. */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final JavaMailSender mailSender;

    public NotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /** Sends an email without blocking the package registration request. */
    @Async
    public void notifyPackageArrived(List<String> recipientEmails, String carrierName,
                                     String trackingCode, String unitNumber) {
        if (recipientEmails == null || recipientEmails.isEmpty()) {
            log.info("No resident e-mails for unit {}; skipping package notification.", unitNumber);
            return;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(recipientEmails.toArray(new String[0]));
            msg.setSubject("\uD83D\uDCE6 Sua encomenda da " + carrierName + " chegou na portaria!");
            msg.setText("Olá! Uma encomenda (" + trackingCode + ") para a unidade " + unitNumber
                + " foi recebida na portaria. Retire-a em breve. Transportadora: " + carrierName + ".");
            mailSender.send(msg);
            log.info("Package notification sent to {}", recipientEmails);
        } catch (Exception e) {
            log.warn("Could not send package e-mail (Mailpit offline?): {}", e.getMessage());
        }
    }
}
