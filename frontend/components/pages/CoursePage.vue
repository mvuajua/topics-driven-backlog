<template>
    <section id="course-page">
        <template v-if="course">
            <h1>
                {{ course.short_title }}
                <small class="text-muted">
                    {{ course.title }}
                    ({{ getSemesterInfo(course.semester_type, course.semester_year).fullString }})
                </small>
            </h1>

            <p v-if="course.hyperlink" >
                <a :href="course.hyperlink">{{ course.hyperlink }}</a>
            </p>

            <BCard no-body>
                <BTabs card>
                    <BTab title="Info">
                        <p>
                            Enrollment for this course is currently {{ course.allow_enrollment ? 'open' : 'closed' }}.
                        </p>

                        <template v-if="course.permissions.course.update">
                            <BRow>
                                <BCol md="6">
                                    <h3>Instructors</h3>

                                    <p
                                        class="mt-2 mb-0"
                                        v-for="instructor in course.instructors"
                                        :key="instructor.id">
                                        {{ instructor.email }}

                                        <BButton
                                            v-if="instructor.id !== $store.state.user.id"
                                            type="button"
                                            size="sm"
                                            variant="outline-danger"
                                            v-confirm="{
                                                action: removeInstructor.bind(this, instructor.id),
                                                text: 'Are you sure you want to remove this instructor from this course?'
                                            }">
                                                <VIcon name="user-times" />
                                        </BButton>

                                        <span v-else>(you)</span>
                                    </p>
                                </BCol>
                                <BCol md="6">
                                    <InstructorForm :course-id="course.id"/>
                                </BCol>
                            </BRow>
                        </template>
                    </BTab>
                    <BTab 
                        title="Projects" 
                        active>

                        <ul :class="['list-unstyled', $style.list]">
                            <ProjectItem
                                class="mb-2"
                                v-for="project in projects"
                                :data="project"
                                :key="project.id"/>

                            <ProjectItem
                                v-if="course.permissions.projects.create && !isEnrolledToProjectInCourse"
                                view="new"
                                :class="$style.new"
                                :data="newProject"
                                :course-id="course.id"/>
                        </ul>
                    </BTab>
                    <BTab 
                        v-if="course.permissions.topics.read" 
                        title="Topics">

                        <ul
                            class="list-unstyled"
                            v-if="topics.length">

                            <TopicItem
                                class="mb-2"
                                v-for="topic in topics"
                                :data="topic"
                                :key="topic.id"/>
                        </ul>

                        <p v-else>No topics in this course yet.</p>

                        <TopicForm
                            ref="topicForm"
                            v-if="showTopicForm"
                            v-model="newTopic"
                            @cancel="showTopicForm = false"
                            @submit="addTopic"/>

                        <BButton
                            v-else-if="course.permissions.topics.create"
                            type="button"
                            variant="primary"
                            @click="showTopicForm = true">Add topic</BButton>
                    </BTab>
                    <BTab
                        v-if="course.permissions.sprints.read" 
                        title="Sprints">

                        <ul 
                            class="list-unstyled" 
                            v-if="sprints.length">

                            <SprintItem 
                                class="mb-2" 
                                v-for="sprint in sprints" 
                                :data="sprint" 
                                :key="sprint.id"/>
                        </ul>

                        <p v-else>No sprints in this course yet.</p>

                        <SprintForm 
                            ref="sprintForm"
                            v-if="showSprintForm"
                            :course="course"
                            v-model="newSprint" 
                            @cancel="showSprintForm = false" 
                            @submit="addSprint"/>

                        <SprintCollectionForm 
                            ref="sprintCollectionForm"
                            v-else-if="showCollectionForm" 
                            v-model="newCollection"
                            @cancel="showCollectionForm = false"
                            @submit="addCollection"/>

                        <template v-else>
                            <BButton 
                                type="button" 
                                variant="primary" 
                                @click="showSprintForm = true">Add sprint</BButton>
                            
                            <BButton 
                                type="button" 
                                variant="primary" 
                                @click="showCollectionForm = true">Add multiple sprints</BButton>
                        </template>
                    </BTab>
                </BTabs>
            </BCard>
        </template>
        <NotFound v-else/>
    </section>
</template>

<script>
import '@icons/user-times';
import BCard from '@bootstrap/card/card';
import BTabs from '@bootstrap/tabs/tabs';
import BTab from '@bootstrap/tabs/tab';
import BButton from '@bootstrap/button/button';
import BRow from '@bootstrap/layout/row';
import BCol from '@bootstrap/layout/col';
import NotFound from '@/components/elements/NotFound';
import SprintItem from '@/components/elements/SprintItem';
import SprintForm from '@/components/forms/SprintForm';
import SprintCollectionForm from '@/components/forms/SprintCollectionForm';
import ProjectForm from '@/components/forms/ProjectForm';
import ProjectItem from '@/components/elements/ProjectItem';
import TopicForm from '@/components/forms/TopicForm';
import TopicItem from '@/components/elements/TopicItem';
import InstructorForm from '@/components/forms/InstructorForm';
import VIcon from 'vue-awesome/components/Icon';
import { info } from '@/helper/semester';

export default {
    components: {
        SprintCollectionForm,
        SprintForm,
        ProjectForm,
        TopicForm,
        SprintItem,
        ProjectItem,
        TopicItem,
        NotFound,
        BCard,
        BTabs,
        BTab,
        BButton,
        InstructorForm,
        BRow,
        BCol,
        VIcon,
    },
    data() {
        return {
            showSprintForm: false,
            showCollectionForm: false,
            showProjectForm: false,
            showTopicForm: false,
            newSprint: this.$store.getters['sprints/template'](),
            newCollection: {},
            newProject: this.$store.getters['projects/template'](),
            newTopic: this.$store.getters['topics/template'](),
        };
    },
    computed: {
        /**
         * Course to display
         * @returns {object}
         */
        course() {
            return this.$store.getters['courses/byId'](
                parseInt(this.$route.params.id, 10)
            );
        },

        /**
         * Sprints in course sorted by start date
         * @returns {array}
         */
        sprints() {
            return this.course
                ? this.$store.getters['sprints/all'](this.course.id)
                    .sort((a, b) => a.start_date.localeCompare(b.start_date))
                : [];
        },

        /** 
         * Projects in course
         * @returns {array}
         */
        projects() {
            return this.course
                ? this.$store.getters['projects/all'](this.course.id)
                : [];
        },

        /**
         * Topics in course
         * @returns {array}
         */
        topics() {
            return this.course
                ? this.$store.getters['topics/all'](this.course.id)
                : [];
        },

        isEnrolledToProjectInCourse() {
            return this.projects.filter(
                p => p.user_ids && p.user_ids.indexOf(this.$store.state.user.id) > -1
            ).length > 0;
        },
    },
    methods: {
        /**
         * Add a sprint to the given course
         */
        async addSprint() {
            try {
                await this.$store.dispatch('sprints/create', {
                    parentId: this.course.id,
                    ...this.newSprint,
                });
    
                this.newSprint = this.$store.getters['sprints/template']();
                
                this.$nextTick(() => {
                    !this.$refs.sprintForm || this.$refs.sprintForm.$el.reset();

                    if (this.sprints.length < 1) {
                        window.location.reload();
                    }
                });
            } catch (err) {
                /* istanbul ignore next */
                this.$notify({
                    title: 'Sprint creation failed',
                    text: err.body.message,
                    type: 'error',
                });
            }
        },

        /**
         * Add a sprint collection to the given course
         */
        async addCollection() {
            try {
                await this.$store.dispatch('sprints/createCollection', {
                    parentId: this.course.id,
                    collection: this.newCollection,
                });
    
                this.newCollection = {};

                this.$nextTick(() => {
                    !this.$refs.sprintCollectionForm || this.$refs.sprintCollectionForm.$el.reset();

                    if (this.sprints.length < 1) {
                        window.location.reload();
                    }
                });
            } catch (err) {
                /* istanbul ignore next */
                this.$notify({
                    title: 'Sprints creation failed',
                    text: err.body.message,
                    type: 'error',
                });
            }
        },

        async addProject() {
            try {
                await this.$store.dispatch('projects/create', {
                    parentId: this.course.id,
                    ...this.newProject,
                });

                this.newProject = this.$store.getters['projects/template']();

                this.$nextTick(() => {
                    !this.$refs.projectForm || this.$refs.projectForm.$el.reset();

                    if (this.projects.length < 1) {
                        window.location.reload();
                    }
                });
            } catch (err) {
                /* istanbul ignore next */
                this.$notify({
                    title: 'Validation failed',
                    text: err.body.message.replace('Validation failed: ', ''),
                    type: 'error',
                });
            }
        },

        async addTopic() {
            try {
                await this.$store.dispatch('topics/create', {
                    parentId: this.course.id,
                    ...this.newTopic,
                });
    
                this.newTopic = this.$store.getters['topics/template']();      
                
                this.$nextTick(() => {
                    !this.$refs.topicForm || this.$refs.topicForm.$el.reset();

                    if (this.topics.length < 1) {
                        window.location.reload();
                    }
                });
            } catch (err) {                
                /* istanbul ignore next */
                this.$notify({
                    title: 'Topic creation failed',
                    text: err.body.message,
                    type: 'error',
                });
            }
        },

        async removeInstructor(userId) {
            try {
                await this.$store.dispatch('courses/removeInstructor', {
                    id: this.course.id,
                    userId: userId,
                });
            } catch (err) {
                /* istanbul ignore next */
                this.$notify({
                    title: 'Course update failed',
                    text: err.body.message,
                    type: 'error',
                });
            }
        },

        /**
         * Semester info for given type and year
         * @param {string} type
         * @param {string} year
         * @returns {{semesterStart: *, semester: string, year: number, fullString: string, valueString: string}}
         */
        getSemesterInfo(type, year) {
            return info(type, year);
        },
    },
};
</script>

<style lang="scss" module>
    .list {
        display: grid;
        grid-gap: 8px;
        grid-template-columns: 1fr 1fr 1fr;
        grid-auto-rows: minmax(200px, 1fr);
    }

    .new {
        color: rgba(0, 0, 0, .125);
        border: 1px solid currentColor;

        &:hover {
            color: rgba(0, 0, 0, .25);
        }
    }
</style>