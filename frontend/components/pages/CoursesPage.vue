<template>
    <section id="courses-page">
        <h1>Courses</h1>

        <ul 
            v-if="courses.length" 
            class="list-unstyled">

            <CourseItem
                class="mb-2"
                v-for="course in courses"
                :data="course"
                :key="course.id"/>
        </ul>

        <p v-else>No courses yet.</p>

        <CourseForm
            ref="courseForm"
            v-if="showForm"
            v-model="newCourse"
            @cancel="showForm = false"
            @submit="saveCourse"/>

        <BButton
            v-else-if="$store.state.user.permissions.courses.create"
            type="button"
            variant="primary"
            @click="showForm = true">Add course</BButton>
    </section>
</template>

<script>
import BForm from '@bootstrap/form/form';
import BFormGroup from '@bootstrap/form-group/form-group';
import BFormInput from '@bootstrap/form-input/form-input';
import BFormSelect from '@bootstrap/form-select/form-select';
import BRow from '@bootstrap/layout/row';
import BCol from '@bootstrap/layout/col';
import BButton from '@bootstrap/button/button';
import CourseForm from '@/components/forms/CourseForm';
import CourseItem from '@/components/elements/CourseItem';

export default {
    components: { BForm, BFormGroup, BFormInput, BFormSelect, BRow, BCol, BButton, CourseForm, CourseItem },
    data() {
        return {
            showForm: false,
            newCourse: this.$store.getters['courses/template'](),
        };
    },
    computed: {
        /**
         * All courses
         * @returns {array}
         */
        courses() {
            return this.$store.getters['courses/all'];
        },
    },
    methods: {
        /**
         * Save current form state as new story
         */
        async saveCourse() {
            const semesterSplit = this.newCourse.semester.split('*');
            this.newCourse.semester_type = semesterSplit[0];
            this.newCourse.semester_year = parseInt(semesterSplit[1], 10);

            try {
                await this.$store.dispatch('courses/create', this.newCourse);
                this.newCourse = this.$store.getters['courses/template']();

                this.$nextTick(() => {
                    !this.$refs.courseForm || this.$refs.courseForm.$el.reset();
                });
            } catch (err) {
                /* istanbul ignore next */
                this.$notify({
                    title: 'Course creation failed',
                    text: err.body.message,
                    type: 'error',
                });
            }
        },
    },
};
</script>