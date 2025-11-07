package com.captainecho.captainecho.adventure.domain;

import com.captainecho.captainecho.interest.domain.SubInterest;
import com.captainecho.captainecho.student.domain.Student;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "day_problem")
public class DayProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "day_problem_id")
    private Integer dayProblemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interest_id", nullable = false)
    private SubInterest subInterest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adventure_type_id", nullable = false)
    private AdventureType adventureType;

    @Column(name = "assigned_date", nullable = false)
    private LocalDate assignedDate;

    @Column(name="problem_text", nullable = false, length = 150)
    private String problemText;

    @Column(name = "seq_no", nullable = false)
    private Short seqNo;

    @Column(name = "level", nullable = false)
    private Short level;

    @Column(name = "hint", length = 300)
    private String hint;

    @Column(name = "image_url", length = 2048)
    private String imageUrl;

    @Column(name = "sound_url", length = 2048)
    private String soundUrl;

    @Column(name = "problem_phonemes", columnDefinition = "TEXT[]", nullable = false)
    private String[] problemPhonemes;

    @Column(name = "blank_position", length = 20)
    @Enumerated(EnumType.STRING)
    private BlankPosition blankPosition;

    @Column(name = "blank_phoneme", length = 5)
    private String blankPhoneme;

    @Column(name = "choices", columnDefinition = "TEXT[]")
    private String[] choices;

    @Column(name = "correct_answer", length = 100)
    private String correctAnswer;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_completed", nullable = false)
    @ColumnDefault("false")
    private Boolean isCompleted = false;

    @Builder
    public DayProblem(Student student, SubInterest subInterest, AdventureType adventureType,
                      LocalDate assignedDate, Short seqNo, Short level, String problemText,
                      String hint, String imageUrl, String soundUrl, String[] problemPhonemes,
                      BlankPosition blankPosition, String blankPhoneme, String[] choices,
                      String correctAnswer) {
        this.student = student;
        this.subInterest = subInterest;
        this.adventureType = adventureType;
        this.assignedDate = assignedDate;
        this.seqNo = seqNo;
        this.level = level;
        this.problemText = problemText;
        this.hint = hint;
        this.imageUrl = imageUrl;
        this.soundUrl = soundUrl;
        this.problemPhonemes = problemPhonemes;
        this.blankPosition = blankPosition;
        this.blankPhoneme = blankPhoneme;
        this.choices = choices;
        this.correctAnswer = correctAnswer;
        this.isCompleted = false;
    }
}
